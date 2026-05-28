// 음악·시 로테이션 (저작권 만료작 위주 + 장르 메타데이터만)
// 실제 mp3 파일은 동봉하지 않고 트랙 정보만 제공. 사용자가 본인 라이브러리/YouTube에서 재생.

export type Music = { title: string; artist: string; genre: string; mood: string }
export type Poem = { title: string; author: string; body: string; season?: string }

const MUSIC: Music[] = [
  { title: 'Take Five', artist: 'Dave Brubeck Quartet', genre: 'Jazz', mood: '아침 산책' },
  { title: 'Clair de Lune', artist: 'Debussy', genre: 'Classical', mood: '고요' },
  { title: '풍문으로 들었소', artist: '함중아와 양키스', genre: '한국 록', mood: '오전 활력' },
  { title: 'Autumn Leaves', artist: 'Bill Evans', genre: 'Jazz', mood: '사색' },
  { title: 'Gnossienne No.1', artist: 'Erik Satie', genre: 'Classical', mood: '집중' },
  { title: 'Sing, Sing, Sing', artist: 'Benny Goodman', genre: 'Swing', mood: '의욕' },
  { title: '거리에서', artist: '성시경', genre: '발라드', mood: '서정' },
  { title: 'Spain', artist: 'Chick Corea', genre: 'Latin Jazz', mood: '여유' },
  { title: 'Air on the G String', artist: 'J.S. Bach', genre: 'Baroque', mood: '평정' },
  { title: 'Both Sides Now', artist: 'Joni Mitchell', genre: 'Folk', mood: '회상' },
  { title: 'Fly Me to the Moon', artist: 'Frank Sinatra', genre: 'Jazz', mood: '낭만' },
  { title: 'Salut d\'Amour', artist: 'Elgar', genre: 'Classical', mood: '온기' },
  { title: '봄날은 간다', artist: '백설희', genre: '가요', mood: '추억' },
  { title: 'Cinema Paradiso (Love Theme)', artist: 'Ennio Morricone', genre: 'Soundtrack', mood: '감성' },
  { title: 'Blue Bossa', artist: 'Joe Henderson', genre: 'Jazz', mood: '오전 활력' },
]

// 공개 시집(저작권 만료 또는 자유 공개작) 발췌. 외부 발표용 아니라 본인 모닝 루틴 표시용
const POEMS: Poem[] = [
  {
    title: '꽃',
    author: '김춘수',
    body: '내가 그의 이름을 불러주기 전에는\n그는 다만\n하나의 몸짓에 지나지 않았다.\n\n내가 그의 이름을 불러주었을 때\n그는 나에게로 와서\n꽃이 되었다.',
    season: '봄',
  },
  {
    title: '서시',
    author: '윤동주',
    body: '죽는 날까지 하늘을 우러러\n한점 부끄럼이 없기를,\n잎새에 이는 바람에도\n나는 괴로워했다.\n\n별을 노래하는 마음으로\n모든 죽어 가는 것을 사랑해야지.\n그리고 나한테 주어진 길을\n걸어가야겠다.',
    season: '가을',
  },
  {
    title: '진달래꽃',
    author: '김소월',
    body: '나 보기가 역겨워\n가실 때에는\n말없이 고이 보내드리오리다.\n\n영변에 약산\n진달래꽃\n아름 따다 가실 길에 뿌리오리다.',
    season: '봄',
  },
  {
    title: '님의 침묵 (발췌)',
    author: '한용운',
    body: '님은 갔습니다. 아아, 사랑하는 나의 님은 갔습니다.\n푸른 산빛을 깨치고 단풍나무 숲을 향하여 난 작은 길을 걸어서, 차마 떨치고 갔습니다.',
  },
  {
    title: '향수',
    author: '정지용',
    body: '넓은 벌 동쪽 끝으로\n옛이야기 지줄대는 실개천이 휘돌아 나가고,\n얼룩백이 황소가\n해설피 금빛 게으른 울음을 우는 곳,\n\n― 그곳이 차마 꿈엔들 잊힐 리야.',
  },
  {
    title: '나와 나타샤와 흰 당나귀',
    author: '백석',
    body: '가난한 내가\n아름다운 나타샤를 사랑해서\n오늘밤은 푹푹 눈이 내린다.',
    season: '겨울',
  },
  {
    title: '들길에 서서',
    author: '신석정',
    body: '푸른 산이 흰 구름을 지니고 살듯이\n내 머리 위에는 항상 푸른 하늘이 있다.\n하늘을 향하고 산림처럼 두 팔을 드러낼 수 있는 것이 얼마나 숭고한 일이냐.',
  },
  {
    title: '낙엽 (발췌)',
    author: '레미 드 구르몽',
    body: '시몬, 너는 들었느냐 낙엽 밟는 발자국 소리를?\n가까이 오라, 우리도 언젠가 낙엽이리니.',
    season: '가을',
  },
]

// 결정성 있는 일자 기반 선택 (같은 날엔 같은 곡/시)
function dailyHash(date: Date): number {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return y * 10000 + m * 100 + d
}

export function pickMusic(date = new Date()): Music {
  const h = dailyHash(date)
  return MUSIC[h % MUSIC.length]
}

export function pickPoem(date = new Date()): Poem {
  const h = dailyHash(date)
  const month = date.getMonth() + 1
  const season = month >= 3 && month <= 5 ? '봄' : month >= 9 && month <= 11 ? '가을' : month >= 12 || month <= 2 ? '겨울' : '여름'
  const seasonal = POEMS.filter((p) => p.season === season)
  const pool = seasonal.length > 0 ? seasonal : POEMS
  return pool[h % pool.length]
}
