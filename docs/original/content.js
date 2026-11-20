/* 라이킹 가안 내용 파일
   이름, 음식, 이야기 원고, 지도 위치는 고객사 확인 전이라 비워 두었다.
   값을 받으면 이 파일만 고친다. 사진은 media 폴더, 작은 사진은 media/s 폴더에 있다. */
window.LIKING = {
  // 사진 방향: L은 가로, P는 세로
  photos: {
    '64A9115': 'L', '64A9287': 'P', '64A9301': 'L', '64A9334': 'P', '64A9338': 'P', '64A9512': 'P',
    '64A9382': 'P', '64A9392': 'L', '64A9477': 'L', '64A9488': 'P', '64A9494': 'L',
    '64A9626': 'L', '64A9679': 'P', '64A9721': 'P', '64A9781': 'P'
  },
  // 화면을 가득 채울 때 잘리지 않아야 하는 지점 (가로 위치, 세로 위치)
  focus: {
    '64A9115': '38% 30%', '64A9287': '50% 18%', '64A9301': '50% 45%', '64A9334': '55% 50%', '64A9338': '50% 45%', '64A9512': '60% 58%',
    '64A9382': '50% 38%', '64A9392': '73% 50%', '64A9477': '24% 40%', '64A9488': '55% 60%', '64A9494': '72% 36%',
    '64A9626': '54% 38%', '64A9679': '52% 52%', '64A9721': '55% 45%', '64A9781': '50% 22%'
  },
  // 첫 화면에서 눌러 넘기는 순서
  // 사람이 나온 사진 6장만 쓴다. 한 사람에 두 장이고 media/cut 폴더에 사람만 오려 낸 마스크가 있다.
  sequence: ['64A9115', '64A9287', '64A9494', '64A9382', '64A9781', '64A9679'],
  // 첫 화면에서 사람 뒤로 들어가는 MAP TO TABLE 글자. 사진마다 줄 수, 크기, 높이, 색, 모양이 다르다.
  // m은 좁은 화면, d는 넓은 화면. y는 글자 가운데가 놓이는 높이, cls는 skew(기울임)와 outline(테두리만).
  heroMarks: {
    '64A9115': { color: '#ffffff', cls: '',
      m: { lines: ['MAP TO', 'TABLE'], fs: '19vw', y: '26%' },
      d: { lines: ['MAP TO TABLE'], fs: 'min(9.8vw, 30svh)', y: '31%' } },
    '64A9287': { color: '#f4f1ea', cls: '',
      m: { lines: ['MAP', 'TO', 'TABLE'], fs: '22vw', y: '40%' },
      d: { lines: ['MAP TO', 'TABLE'], fs: 'min(16.5vw, 34svh)', y: '46%' } },
    '64A9494': { color: '#ffffff', cls: 'outline skew',
      m: { lines: ['MAP TO', 'TABLE'], fs: '19vw', y: '31%' },
      d: { lines: ['MAP TO TABLE'], fs: 'min(9.8vw, 30svh)', y: '38%' } },
    '64A9382': { color: '#2B4FC7', cls: '',
      m: { lines: ['MAP', 'TO', 'TABLE'], fs: '22vw', y: '40%' },
      d: { lines: ['MAP TO TABLE'], fs: 'min(9.8vw, 30svh)', y: '40%' } },
    '64A9781': { color: '#ffffff', cls: 'skew',
      m: { lines: ['MAP TO', 'TABLE'], fs: '19vw', y: '24%' },
      d: { lines: ['MAP TO TABLE'], fs: 'min(9.8vw, 30svh)', y: '32%' } },
    '64A9679': { color: '#f4f1ea', cls: 'outline',
      m: { lines: ['MAP', 'TO', 'TABLE'], fs: '22vw', y: '45%' },
      d: { lines: ['MAP TO', 'TABLE'], fs: 'min(16.5vw, 34svh)', y: '48%' } }
  },
  people: [
    {
      id: 1, label: '이야기 01', name: '', food: '',
      color: '#D2BB1E', onColor: '#141414',
      cover: '64A9115', coverPos: '40% 30%', face: '64A9115', facePos: '42% 30%', hands: '64A9301',
      photos: ['64A9115', '64A9287', '64A9301', '64A9334', '64A9512', '64A9338'],
      pin: [24, 60]
    },
    {
      id: 2, label: '이야기 02', name: '', food: '',
      color: '#2B4FC7', onColor: '#ffffff',
      cover: '64A9494', coverPos: '74% 34%', face: '64A9494', facePos: '72% 34%', hands: '64A9488',
      photos: ['64A9494', '64A9382', '64A9488', '64A9477', '64A9392'],
      pin: [43, 38]
    },
    {
      id: 3, label: '이야기 03', name: '', food: '',
      color: '#C81E55', onColor: '#ffffff',
      cover: '64A9626', coverPos: '54% 30%', face: '64A9781', facePos: '50% 24%', hands: '64A9721',
      photos: ['64A9781', '64A9626', '64A9721', '64A9679'],
      pin: [64, 54]
    },
    { id: 4, label: '이야기 04', name: '', food: '', color: '#8a8a8a', onColor: '#ffffff', photos: [], pin: [79, 32] },
    { id: 5, label: '이야기 05', name: '', food: '', color: '#8a8a8a', onColor: '#ffffff', photos: [], pin: [34, 78] },
    { id: 6, label: '이야기 06', name: '', food: '', color: '#8a8a8a', onColor: '#ffffff', photos: [], pin: [59, 76] }
  ],
  // 참여 질문. 순서와 낱말은 사업계획서 3절 과제 기획에 적힌 대로다.
  // 음식, 당시의 삶과 지역의 맥락, 참여자의 유사한 기억, 나의 음식 이야기 순서이고
  // 주민이 소개한 음식에 담긴 돌봄, 일상, 계절의 기억을 읽은 뒤 자신의 경험과 연결해 기록한다.
  questions: [
    { title: '주민의 음식', ask: '주민이 소개한 음식 가운데 무엇이 기억에 남았나요?' },
    { title: '당시의 삶과 지역', ask: '그 음식에 담긴 돌봄, 일상, 계절 가운데 무엇이 보였나요?' },
    { title: '나의 비슷한 기억', ask: '나에게도 비슷한 기억이 있나요?' },
    { title: '나의 음식 이야기', ask: '나의 음식 이야기를 기록해 주세요.' }
  ]
};
