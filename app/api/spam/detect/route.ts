import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Common spam keywords and patterns
const SPAM_KEYWORDS = [
  'winner', 'congratulations', 'click here', 'act now', 'limited time',
  'free money', 'nigerian prince', 'inheritance', 'lottery', 'prize',
  'viagra', 'cialis', 'pharmacy', 'weight loss', 'make money fast',
  'work from home', 'earn $$$', 'cash bonus', 'risk free', 'no cost',
  'free trial', 'credit card', 'refinance', 'lower interest', 'debt',
  'as seen on', 'guarantee', '100% free', 'limited offer', 'order now',
  'call now', 'don\'t delete', 'urgent', 'important information',
  'you have been selected', 'claim your', 'dear friend', 'this is not spam'
];

// POST - Analyze message for spam indicators
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, subject, body, senderEmail } = await request.json();

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    // Check if sender is already reported as spam
    const supabaseClient: any = supabase;
    const { data: existingReport } = await supabaseClient
      .from('spam_reports')
      .select('*')
      .eq('user_id', user.id)
      .eq('sender_email', senderEmail)
      .eq('is_spam', true)
      .limit(1)
      .single();

    let spamScore = 0;
    const reasons: string[] = [];

    // 1. Check if sender was previously marked as spam
    if (existingReport) {
      spamScore += 50;
      reasons.push('Sender previously marked as spam');
    }

    // 2. Analyze subject line
    const subjectLower = (subject || '').toLowerCase();
    const matchedSubjectKeywords = SPAM_KEYWORDS.filter(keyword =>
      subjectLower.includes(keyword.toLowerCase())
    );

    if (matchedSubjectKeywords.length > 0) {
      spamScore += matchedSubjectKeywords.length * 10;
      reasons.push(`Subject contains spam keywords: ${matchedSubjectKeywords.join(', ')}`);
    }

    // 3. Analyze body
    const bodyLower = (body || '').toLowerCase();
    const matchedBodyKeywords = SPAM_KEYWORDS.filter(keyword =>
      bodyLower.includes(keyword.toLowerCase())
    );

    if (matchedBodyKeywords.length > 0) {
      spamScore += matchedBodyKeywords.length * 5;
      reasons.push(`Body contains ${matchedBodyKeywords.length} spam keyword(s)`);
    }

    // 4. Check for excessive capitalization in subject
    if (subject && subject === subject.toUpperCase() && subject.length > 10) {
      spamScore += 15;
      reasons.push('Subject is all caps');
    }

    // 5. Check for excessive exclamation marks
    const exclamationCount = (subject + ' ' + body).split('!').length - 1;
    if (exclamationCount > 3) {
      spamScore += exclamationCount * 3;
      reasons.push(`Excessive exclamation marks (${exclamationCount})`);
    }

    // 6. Check for suspicious sender patterns
    if (senderEmail && /^[a-z0-9]{20,}@/.test(senderEmail)) {
      spamScore += 10;
      reasons.push('Suspicious sender email pattern');
    }

    // 7. Check for multiple dollar signs
    const dollarCount = (subject + ' ' + body).split('$').length - 1;
    if (dollarCount > 2) {
      spamScore += dollarCount * 5;
      reasons.push(`Multiple dollar signs (${dollarCount})`);
    }

    // Cap spam score at 100
    spamScore = Math.min(spamScore, 100);

    const isSpam = spamScore >= 50;

    return NextResponse.json({
      messageId,
      isSpam,
      spamScore,
      confidence: spamScore >= 75 ? 'high' : spamScore >= 50 ? 'medium' : 'low',
      reasons,
      recommendation: isSpam ? 'Move to spam folder' : 'Appears safe',
    });
  } catch (error) {
    console.error('Spam detection error:', error);
    return NextResponse.json({ error: 'Failed to detect spam' }, { status: 500 });
  }
}
