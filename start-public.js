const ngrok = require('ngrok');

async function start() {
  try {
    const url = await ngrok.connect({
      proto: 'http',
      addr: 3000,
      region: 'ap'
    });

    console.log('\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('🌐 공개 URL이 생성되었습니다!');
    console.log('═══════════════════════════════════════════════════');
    console.log(`\n📱 다른 Wi-Fi에서 접속 가능:`)
    console.log(`${url}`);
    console.log('\n💡 이 URL을 친구들에게 공유하세요!');
    console.log('═══════════════════════════════════════════════════\n');

    // ngrok이 닫힐 때까지 유지
    process.on('SIGINT', async () => {
      await ngrok.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

start();
