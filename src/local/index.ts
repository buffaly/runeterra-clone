import { PANEL_DATA_TH } from './panelData.th';
import { PANEL_DATA_JA } from './panelData.ja';
import { PANEL_DATA_KO } from './panelData.ko';
import { PANEL_DATA_ZH_CN } from './panelData.zh-cn';
import { PANEL_DATA_ZH_TW } from './panelData.zh-tw';
import { PANEL_DATA_FR } from './panelData.fr';
import { PANEL_DATA_DE } from './panelData.de';
import { PANEL_DATA_ES } from './panelData.es';
import { PANEL_DATA_PT } from './panelData.pt';
import { PANEL_DATA_RU } from './panelData.ru';
import { PANEL_DATA as PANEL_DATA_EN } from '../const/panelData'

export const TRANSLATIONS = {
  'en': PANEL_DATA_EN,
  'th': PANEL_DATA_TH,
  'ja': PANEL_DATA_JA,
  'ko': PANEL_DATA_KO,
  'zh-cn': PANEL_DATA_ZH_CN,
  'zh-tw': PANEL_DATA_ZH_TW,
  'fr': PANEL_DATA_FR,
  'de': PANEL_DATA_DE,
  'es': PANEL_DATA_ES,
  'pt': PANEL_DATA_PT,
  'ru': PANEL_DATA_RU
};

export type SupportedLanguage = 'th' | 'ja' | 'ko' | 'zh-cn' | 'zh-tw' | 'fr' | 'de' | 'es' | 'pt' | 'ru' | 'en';

export function getTranslation(language: SupportedLanguage) {
  return TRANSLATIONS[language];
}
