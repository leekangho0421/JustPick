const http = require('http');

http.get('http://localhost:3000/', (res) => {
  let html = '';

  res.on('data', (chunk) => {
    html += chunk;
  });

  res.on('end', () => {
    // Check if the landing screen has our new design elements
    const checks = {
      'Game Icon Gradient Box': html.includes('rounded-3xl bg-gradient-to-br from-pink-400 to-blue-400'),
      'PARTY VOTE Title': html.includes('PARTY') && html.includes('VOTE'),
      'Create Room Button': html.includes('새 방 만들기'),
      'Room Code Input': html.includes('landing-join-code'),
      'Quick Join Function': html.includes('quickJoinRoom()'),
      'Or Divider': html.includes('또는')
    };

    console.log('✅ Design Elements Verification:\n');
    let allPassed = true;
    for (const [check, passed] of Object.entries(checks)) {
      console.log(`  ${passed ? '✓' : '✗'} ${check}`);
      if (!passed) allPassed = false;
    }

    console.log(`\n${allPassed ? '✅ All design elements are present!' : '❌ Some elements are missing'}`);
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('Error:', err);
  process.exit(1);
});
