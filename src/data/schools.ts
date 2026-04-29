export type SchoolCandidate = {
  name: string
  state: string
  city: string
  aliases: string[]
}

const school = (
  name: string,
  state: string,
  city: string,
  aliases: string[] = []
): SchoolCandidate => ({
  name,
  state,
  city,
  aliases,
})

export const SCHOOL_CANDIDATES: SchoolCandidate[] = [
  school('麻坡中化中学', 'Johor', 'Muar', ['Chong Hwa High School Muar']),
  school('利丰港培华独立中学', 'Johor', 'Sungai Mati', ['Pei Hwa High School']),
  school('居銮中华中学', 'Johor', 'Kluang', ['Chung Hwa High School Kluang']),
  school('永平中学', 'Johor', 'Yong Peng', ['Yong Peng High School']),
  school('峇株巴辖华仁中学', 'Johor', 'Batu Pahat', ['Huaren High School']),
  school('新文龙中华中学', 'Johor', 'Batu Pahat', [
    'Chung Hwa High School Xin Wen Long',
  ]),
  school('笨珍培群独立中学', 'Johor', 'Pontian', ['Pei Chun High School']),
  school('新山宽柔中学', 'Johor', 'Johor Bahru', ['Foon Yew High School']),
  school('新山宽柔中学古来分校', 'Johor', 'Kulai', [
    'Foon Yew High School Kulai',
  ]),
  school('新山宽柔中学至达城分校', 'Johor', 'Iskandar Puteri', [
    'Foon Yew High School Iskandar Puteri',
  ]),

  school('马六甲培风中学', 'Melaka', 'Melaka', ['Pay Fong Middle School']),

  school('芙蓉中华中学', 'Negeri Sembilan', 'Seremban', [
    'Chung Hua High School Seremban',
  ]),
  school('波德申中华中学', 'Negeri Sembilan', 'Port Dickson', [
    'Chung Hua High School Port Dickson',
  ]),

  school('吉隆坡中华独立中学', 'Kuala Lumpur', 'Kuala Lumpur', [
    'Chinese High School Kuala Lumpur',
  ]),
  school('吉隆坡循人中学', 'Kuala Lumpur', 'Kuala Lumpur', [
    'Tsun Jin High School',
  ]),
  school('吉隆坡坤成中学', 'Kuala Lumpur', 'Kuala Lumpur', [
    'Kuen Cheng High School',
  ]),
  school('吉隆坡尊孔独立中学', 'Kuala Lumpur', 'Kuala Lumpur', [
    'Confucian Private Secondary School',
  ]),

  school('巴生光华独立中学', 'Selangor', 'Klang', [
    'Kwang Hua Private High School',
  ]),
  school('巴生滨华中学', 'Selangor', 'Klang', ['Pin Hwa High School']),
  school('巴生兴华中学', 'Selangor', 'Klang', ['Hin Hua High School']),
  school('巴生中华独立中学', 'Selangor', 'Klang', [
    'Chung Hua High School Klang',
  ]),

  school('怡保深斋中学', 'Perak', 'Ipoh', ['Sam Chai High School']),
  school('霹雳育才独立中学', 'Perak', 'Ipoh', ['Yu Cai High School']),
  school('怡保培南中学', 'Perak', 'Ipoh', ['Pei Nam High School']),
  school('班台育青中学', 'Perak', 'Pantai Remis', ['Yu Ching High School']),
  school('江沙崇华独立中学', 'Perak', 'Kuala Kangsar', [
    'Chong Hua High School Kuala Kangsar',
  ]),
  school('曼绒南华独立中学', 'Perak', 'Sitiawan', ['Nan Hwa High School']),
  school('霹雳金宝培元独立中学', 'Perak', 'Kampar', ['Pei Yuan High School']),
  school('安顺三民独立中学', 'Perak', 'Teluk Intan', ['Sam Min High School']),
  school('太平华联中学', 'Perak', 'Taiping', ['Hua Lian High School']),

  school('吉兰丹中华独立中学', 'Kelantan', 'Kota Bharu', [
    'Kelantan Chinese High School',
  ]),

  school('双溪大年新民独立中学', 'Kedah', 'Sungai Petani', [
    'Sin Min High School',
  ]),
  school('亚罗士打新民独立中学', 'Kedah', 'Alor Setar', [
    'Sin Min High School Alor Setar',
  ]),
  school('亚罗士打吉华独立中学', 'Kedah', 'Alor Setar', [
    'Keh Hua High School',
  ]),

  school('大山脚日新独立中学', 'Penang', 'Bukit Mertajam', [
    'Jit Sin Independent High School',
  ]),
  school('槟城韩江中学', 'Penang', 'George Town', ['Han Chiang High School']),
  school('槟城锺灵独立中学', 'Penang', 'George Town', [
    'Chung Ling Private High School',
  ]),
  school('槟城槟华女子独立中学', 'Penang', 'George Town', [
    "Penang Chinese Girls' High School",
  ]),
  school('槟城菩提独立中学', 'Penang', 'George Town', [
    'Phor Tay Private High School',
  ]),

  school('古晋中华第一中学', 'Sarawak', 'Kuching', [
    'Kuching Chung Hua No.1 High School',
  ]),
  school('古晋中华第三中学', 'Sarawak', 'Kuching', [
    'Kuching Chung Hua No.3 High School',
  ]),
  school('古晋中华第四中学', 'Sarawak', 'Kuching', [
    'Kuching Chung Hua No.4 High School',
  ]),
  school('石角民立中学', 'Sarawak', 'Kuching', ['Min Lit Secondary School']),
  school('西连民众中学', 'Sarawak', 'Serian', ['Min Zhong High School']),
  school('诗巫光民中学', 'Sarawak', 'Sibu', ['Kwang Min High School']),
  school('诗巫黄乃裳中学', 'Sarawak', 'Sibu', ['Wong Nai Siong High School']),
  school('诗巫建兴中学', 'Sarawak', 'Sibu', ['Kian Hiew High School']),
  school('诗巫公教中学', 'Sarawak', 'Sibu', ['Kung Chiau High School']),
  school('诗巫公民中学', 'Sarawak', 'Sibu', ['Kong Ming High School']),
  school('民都鲁开智中学', 'Sarawak', 'Bintulu', ['Kai Dee High School']),
  school('美里培民中学', 'Sarawak', 'Miri', ['Pei Min High School']),
  school('美里廉律中学', 'Sarawak', 'Miri', ['Lian Lu High School']),
  school('泗里奎民立中学', 'Sarawak', 'Sarikei', ['Min Lit High School']),

  school('沙巴崇正中学', 'Sabah', 'Kota Kinabalu', [
    'Tshung Tsin Secondary School',
  ]),
  school('亚庇建国中学', 'Sabah', 'Kota Kinabalu', ['Kian Kok Middle School']),
  school('沙巴吧巴中学', 'Sabah', 'Papar', ['Papar High School']),
  school('沙巴保佛中学', 'Sabah', 'Beaufort', ['Beaufort High School']),
  school('丹南崇正中学', 'Sabah', 'Tenom', ['Tshung Tsin High School Tenom']),
  school('斗湖巴华中学', 'Sabah', 'Tawau', ['Ba Hua High School']),
  school('古达培正中学', 'Sabah', 'Kudat', ['Pei Tsin High School']),
  school('沙巴拿笃中学', 'Sabah', 'Lahad Datu', ['Lahad Datu High School']),
  school('山打根育源独立中学', 'Sabah', 'Sandakan', ['Yu Yuan High School']),

  school('关丹中华中学', 'Pahang', 'Kuantan', ['Kuantan Chinese High School']),
]
