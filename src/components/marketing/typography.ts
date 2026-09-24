import { LXGW_WenKai_TC, Noto_Serif_SC } from 'next/font/google'

export const editorial = Noto_Serif_SC({ weight: ['600', '700'], subsets: ['latin'], display: 'swap', preload: false, variable: '--font-marketing-editorial' })
export const handwriting = LXGW_WenKai_TC({ weight: '400', subsets: ['latin'], display: 'swap', preload: false })
