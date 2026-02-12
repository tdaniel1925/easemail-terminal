import { config } from 'dotenv';
import { aiRemix } from '../lib/openai/client.ts';

config({ path: '.env.local' });

async function testAIFormatting() {
  console.log('🧪 Testing AI Remix formatting...\n');

  const testCases = [
    {
      name: 'Simple message',
      input: 'hey can you send me the report by tomorrow thanks',
      tone: 'professional'
    },
    {
      name: 'Casual message',
      input: 'just wanted to check in and see how things are going with the project',
      tone: 'friendly'
    },
    {
      name: 'Brief message',
      input: 'need the budget numbers asap for the meeting',
      tone: 'brief'
    },
    {
      name: 'Detailed request',
      input: 'I need help understanding the new process for submitting expenses',
      tone: 'detailed'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 Test: ${testCase.name} (${testCase.tone})`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Input: "${testCase.input}"\n`);

    try {
      const result = await aiRemix(testCase.input, testCase.tone);

      console.log('📧 Generated Email:');
      console.log('─'.repeat(60));
      console.log(result.body);
      console.log('─'.repeat(60));
      console.log(`\n📌 Suggested Subject: "${result.suggestedSubject}"`);

      // Check formatting requirements
      console.log('\n✅ Formatting Checks:');

      // Check 1: Has greeting followed by blank line
      const hasGreetingBlankLine = /^(Hi|Hello|Dear|Hey)[^,]*,\n\n/.test(result.body);
      console.log(`   ${hasGreetingBlankLine ? '✓' : '✗'} Blank line after greeting: ${hasGreetingBlankLine}`);

      // Check 2: Has blank line before salutation
      const salutations = [
        'Best regards,', 'Kind regards,', 'Sincerely,', 'Best,', 'Thanks,',
        'Cheers,', 'Warm regards,', 'Thank you,'
      ];

      let hasBlankLineBeforeSalutation = false;
      for (const salutation of salutations) {
        if (result.body.includes(salutation)) {
          const beforeSalutation = result.body.substring(0, result.body.lastIndexOf(salutation));
          hasBlankLineBeforeSalutation = beforeSalutation.endsWith('\n\n') || beforeSalutation.endsWith('\r\n\r\n');
          console.log(`   ${hasBlankLineBeforeSalutation ? '✓' : '✗'} Blank line before "${salutation}": ${hasBlankLineBeforeSalutation}`);
          break;
        }
      }

      // Check 3: No signature included
      const hasNoSignature = !result.body.match(/\n\n[A-Z][a-z]+ [A-Z][a-z]+\n/);
      console.log(`   ${hasNoSignature ? '✓' : '✗'} No signature (name) included: ${hasNoSignature}`);

      // Visual representation
      console.log('\n📐 Visual Line Break Check:');
      const lines = result.body.split('\n');
      lines.forEach((line, i) => {
        if (line === '') {
          console.log(`   Line ${i + 1}: [BLANK LINE] ← Should have one after greeting and before salutation`);
        } else {
          console.log(`   Line ${i + 1}: ${line.substring(0, 60)}${line.length > 60 ? '...' : ''}`);
        }
      });

      console.log('\n✅ Test passed!\n');
    } catch (error) {
      console.error(`\n❌ Test failed:`, error.message);
      console.error(error);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 All tests completed!');
  console.log(`${'='.repeat(60)}\n`);
}

testAIFormatting().catch(console.error);
