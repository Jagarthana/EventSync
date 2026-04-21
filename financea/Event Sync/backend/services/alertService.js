const nodemailer = require('nodemailer');
const twilio = require('twilio');
const Budget = require('../models/Budget');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Get budget suggestions from past events
const getBudgetSuggestions = async (eventName, totalBudget, totalExpenses, remaining) => {
  try {
    const pastBudgets = await Budget.find({
      status: 'Approved',
      eventName: { $regex: eventName.split(' ')[0], $options: 'i' },
      totalBudget: { $gt: 0 },
      totalExpenses: { $gt: 0 },
    }).limit(3);

    let suggestions = [];

    if (pastBudgets.length > 0) {
      const avgUtilization = pastBudgets.reduce((sum, b) => {
        return sum + (b.totalExpenses / b.totalBudget) * 100;
      }, 0) / pastBudgets.length;

      suggestions.push(`📊 Past similar events used an average of ${Math.round(avgUtilization)}% of their budget.`);

      const pastCategories = [];
      for (const b of pastBudgets) {
        if (b.breakdown && b.breakdown.length > 0) {
          b.breakdown.forEach(item => pastCategories.push(item.category));
        }
      }

      if (pastCategories.length > 0) {
        const uniqueCategories = [...new Set(pastCategories)];
        suggestions.push(`💡 Past events commonly spent on: ${uniqueCategories.join(', ')}.`);
      }
    }

    const remainingPct = (remaining / totalBudget) * 100;

    if (remainingPct <= 50 && remainingPct > 10) {
      suggestions.push(`💰 You have LKR ${remaining.toLocaleString()} remaining. Consider reducing marketing or logistics costs.`);
      suggestions.push(`✂️ Review pending expenses and prioritize essential ones only.`);
      suggestions.push(`📋 Postpone non-critical purchases to the next event cycle.`);
    } else if (remainingPct <= 10) {
      suggestions.push(`⚠️ Only LKR ${remaining.toLocaleString()} remaining. Freeze all non-essential spending immediately.`);
      suggestions.push(`🚨 Contact your Finance Officer before making any new purchases.`);
      suggestions.push(`📝 Document all remaining planned expenses and get prior approval.`);
    }

    return suggestions;
  } catch (err) {
    console.error('Error getting suggestions:', err);
    return [`💰 Remaining balance: LKR ${remaining.toLocaleString()}. Please manage your spending carefully.`];
  }
};

// Send email alert
const sendEmailAlert = async (toEmail, organizerName, eventName, usagePct, totalBudget, totalExpenses, remaining, suggestions) => {
  try {
    const is100 = usagePct >= 100;
    const subject = is100
      ? `🚨 Budget Fully Used — ${eventName}`
      : `⚠️ Budget Alert: ${usagePct}% Used — ${eventName}`;

    const suggestionsHtml = suggestions.length > 0
      ? `<div style="background:#f0f9ff;border-left:4px solid #3a5bd9;padding:16px;margin:16px 0;border-radius:4px">
          <h3 style="color:#0f2744;margin:0 0 10px">💡 Budget Management Suggestions</h3>
          ${suggestions.map(s => `<p style="margin:6px 0;color:#374151">${s}</p>`).join('')}
        </div>`
      : '';

    const newBudgetNote = is100
      ? `<div style="background:#fee2e2;border-left:4px solid #dc2626;padding:16px;margin:16px 0;border-radius:4px">
          <h3 style="color:#dc2626;margin:0 0 8px">🚨 Budget Exhausted</h3>
          <p style="color:#374151;margin:0">Your budget has been fully used. Please submit a new budget request through the Event Sync portal to continue operations.</p>
        </div>`
      : '';

    const html = `
      <div style="font-family:'DM Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#0f2744;padding:24px 32px">
          <h1 style="color:#fff;margin:0;font-size:20px">Event Sync</h1>
          <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px">Budget Alert Notification</p>
        </div>
        <div style="padding:32px">
          <h2 style="color:#0f2744;margin:0 0 8px">${subject}</h2>
          <p style="color:#6b7280;margin:0 0 24px">Hello ${organizerName},</p>
          <p style="color:#374151">Your event <strong>${eventName}</strong> has used <strong style="color:${usagePct >= 90 ? '#dc2626' : '#d97706'}">${usagePct}%</strong> of its total budget.</p>

          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0">
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:14px">Total Budget</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">LKR ${totalBudget.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:14px">Amount Used</td>
                <td style="padding:6px 0;font-weight:600;color:#dc2626;text-align:right">LKR ${totalExpenses.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:14px">Remaining</td>
                <td style="padding:6px 0;font-weight:600;color:#16a34a;text-align:right">LKR ${remaining.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          ${newBudgetNote}
          ${!is100 ? suggestionsHtml : ''}

          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f0f2f8">
            <p style="color:#9ca3af;font-size:12px;margin:0">This is an automated alert from Event Sync. Please log in to the portal for more details.</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Event Sync" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${toEmail} for ${usagePct}% budget usage`);
    return true;
  } catch (err) {
    console.error('❌ Email send error:', err.message);
    return false;
  }
};

// Send WhatsApp alert
const sendWhatsAppAlert = async (toPhone, organizerName, eventName, usagePct, totalBudget, remaining, suggestions) => {
  try {
    const is100 = usagePct >= 100;

    let message = `*Event Sync Budget Alert* 🔔\n\n`;
    message += `Hello ${organizerName},\n\n`;
    message += `Your event *${eventName}* has used *${usagePct}%* of its total budget.\n\n`;
    message += `📊 *Budget Summary*\n`;
    message += `• Total Budget: LKR ${totalBudget.toLocaleString()}\n`;
    message += `• Remaining: LKR ${remaining.toLocaleString()}\n\n`;

    if (is100) {
      message += `🚨 *Budget Exhausted!*\nPlease submit a new budget request through the Event Sync portal.\n`;
    } else {
      message += `💡 *Suggestions*\n`;
      suggestions.slice(0, 2).forEach(s => {
        message += `${s}\n`;
      });
    }

    message += `\n_Event Sync — University Event Management_`;

    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${toPhone}`,
      body: message,
    });

    console.log(`✅ WhatsApp sent to ${toPhone} for ${usagePct}% budget usage`);
    return true;
  } catch (err) {
    console.error('❌ WhatsApp send error:', err.message);
    return false;
  }
};

// Main function — check budget and send alerts
const checkAndSendBudgetAlerts = async (budget) => {
  try {
    const { totalBudget, totalExpenses, remainingBalance, eventName, organizer } = budget;

    if (!totalBudget || totalBudget === 0) return;

    const usagePct = Math.round((totalExpenses / totalBudget) * 100);

    const shouldAlert = usagePct >= 50;
    if (!shouldAlert) return;

    let alertLevel = null;
    if (usagePct >= 100) alertLevel = 100;
    else if (usagePct >= 90) alertLevel = 90;
    else if (usagePct >= 50) alertLevel = 50;

    if (!alertLevel) return;

    const alreadySent = budget.alertsSent || [];
    if (alreadySent.includes(alertLevel)) return;

    const suggestions = alertLevel < 100
      ? await getBudgetSuggestions(eventName, totalBudget, totalExpenses, remainingBalance)
      : [];

    const organizerEmail = organizer?.email;
    const organizerPhone = organizer?.phone;
    const organizerName = organizer?.name || 'Organizer';

    if (organizerEmail) {
      await sendEmailAlert(
        organizerEmail,
        organizerName,
        eventName,
        alertLevel,
        totalBudget,
        totalExpenses,
        remainingBalance,
        suggestions
      );
    }

    if (organizerPhone) {
      await sendWhatsAppAlert(
        organizerPhone,
        organizerName,
        eventName,
        alertLevel,
        totalBudget,
        remainingBalance,
        suggestions
      );
    }

    await budget.constructor.findByIdAndUpdate(budget._id, {
      $addToSet: { alertsSent: alertLevel }
    });

    console.log(`✅ Budget alert sent for ${eventName} at ${alertLevel}% usage`);
  } catch (err) {
    console.error('❌ checkAndSendBudgetAlerts error:', err.message);
  }
};

module.exports = { checkAndSendBudgetAlerts };