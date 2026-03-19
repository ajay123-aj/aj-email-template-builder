export type BlockType = 'text' | 'heading' | 'image' | 'button' | 'divider' | 'spacer' | 'social' | 'columns' | 'header' | 'footer' | 'html' | 'table' | 'list';
export interface BaseBlock<T extends BlockType = BlockType, C = object> { id: string; type: T; config: C; }
export interface TextConfig {
  content: string;
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: string;
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  borderRadius?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
}
export interface HeadingConfig extends TextConfig { level?: 1 | 2 | 3 | 4; }
export interface ImageConfig { src: string; alt?: string; width?: string; height?: string; alignment?: string; padding?: string; margin?: string; backgroundColor?: string; borderRadius?: string; }
export type ButtonBackgroundType = 'color' | 'gradient';
export interface ButtonConfig {
  text: string;
  href: string;
  backgroundColor?: string;
  backgroundColorType?: ButtonBackgroundType;
  backgroundGradient?: { angle?: number; colors?: string[] };
  textColor?: string;
  borderRadius?: string;
  padding?: string;
  alignment?: string;
}
export type DividerBorderType = 'color' | 'gradient';
export interface DividerConfig {
  borderColor?: string;
  borderColorType?: DividerBorderType;
  borderGradient?: { angle?: number; colors?: string[] };
  borderWidth?: string;
  margin?: string;
  width?: string;
}
export interface SpacerConfig { height: string; }
export interface SocialConfig { icons: { type: string; url: string }[]; alignment?: string; }
export interface ColumnsConfig { count: 1 | 2 | 3; widths?: string[]; }
export interface HeaderConfig extends TextConfig { logoUrl?: string; logoAlt?: string; height?: string; glassmorphism?: boolean; }
export interface FooterConfig { content?: string; backgroundColor?: string; padding?: string; fontSize?: string; color?: string; }
export interface HtmlConfig { html: string; }
export interface TableConfig {
  headers?: string[];
  rows?: string[][];
  borderColor?: string;
  fontSize?: string;
  alignment?: string;
}
export interface ListConfig {
  items?: string[];
  listType?: 'ul' | 'ol';
  fontSize?: string;
  color?: string;
}
export type AnyBlock = BaseBlock<'text', TextConfig> | BaseBlock<'heading', HeadingConfig> | BaseBlock<'image', ImageConfig> | BaseBlock<'button', ButtonConfig> | BaseBlock<'divider', DividerConfig> | BaseBlock<'spacer', SpacerConfig> | BaseBlock<'social', SocialConfig> | BaseBlock<'columns', ColumnsConfig> | BaseBlock<'header', HeaderConfig> | BaseBlock<'footer', FooterConfig> | BaseBlock<'html', HtmlConfig> | BaseBlock<'table', TableConfig> | BaseBlock<'list', ListConfig>;
export interface EmailColumn { id: string; width?: string; blocks: AnyBlock[]; }
export type SectionLayout = 'row' | 'column';

export type BackgroundType = 'color' | 'gradient' | 'image';
export interface BackgroundGradient {
  angle?: number;  // degrees, 0 = to top, 90 = to right
  colors?: string[];  // hex or named colors
}
export interface BackgroundOptions {
  backgroundType?: BackgroundType;
  backgroundColor?: string;
  backgroundGradient?: BackgroundGradient;
  backgroundImageUrl?: string;
  backgroundImageSize?: 'cover' | 'contain' | 'auto';
  backgroundImagePosition?: string;
}

export interface EmailSection extends BackgroundOptions { id: string; layout?: SectionLayout; padding?: string; margin?: string; columns: EmailColumn[]; }
export interface EmailTemplate extends BackgroundOptions { id: string; name?: string; width?: string; padding?: string; sections: EmailSection[]; }
