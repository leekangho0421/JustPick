const http = require('http');

http.get('http://localhost:3000/', (res) => {
  let html = '';

  res.on('data', (chunk) => {
    html += chunk;
  });

  res.on('end', () => {
    // Check for the updated design elements
    const checks = {
      '게임 아이콘 보라색 배경': html.includes('from-purple-900 to-purple-700'),
      '제목: 합법적 앞담화': html.includes('합법적 앞담화'),
      '부제목: 다수결 눈치 게임': html.includes('친구들과 함께하는 다수결 눈치 게임'),
      '새 방 만들기 버튼': html.includes('새 방 만들기'),
      '방 코드로 입장하기': html.includes('방 코드로 입장하기'),
      '방 입장 섹션 보라색 테두리': html.includes('border-purple-500/50'),
      '코드 입력 필드': html.includes('landing-join-code'),
      'quickJoinRoom 함수': html.includes('quickJoinRoom()')
    };

    console.log('✅ 디자인 요소 검증:\n');
    let allPassed = true;
    for (const [check, passed] of Object.entries(checks)) {
      console.log(`  ${passed ? '✓' : '✗'} ${check}`);
      if (!passed) allPassed = false;
    }

    console.log(`\n${allPassed ? '✅ 모든 디자인 요소가 정상 적용되었습니다!' : '❌ 일부 요소가 누락되었습니다'}`);
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('Error:', err);
  process.exit(1);
});
