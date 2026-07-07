/**
 * Minimal declarations for the `page-flip` package (StPageFlip), which ships
 * its browser bundle without type definitions. Covers only the API used by
 * FlipbookViewer.
 */
declare module "page-flip" {
  export type SizeType = "fixed" | "stretch";

  export interface FlipSetting {
    width: number;
    height: number;
    size?: SizeType;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    swipeDistance?: number;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    disableFlipByClick?: boolean;
  }

  export interface FlipEvent {
    data: number | string;
    object: PageFlip;
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings: FlipSetting);
    loadFromImages(images: string[]): void;
    updateFromImages(images: string[]): void;
    flipNext(corner?: "top" | "bottom"): void;
    flipPrev(corner?: "top" | "bottom"): void;
    flip(page: number, corner?: "top" | "bottom"): void;
    turnToPage(page: number): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    on(event: "flip" | "changeOrientation" | "changeState" | "init" | "update", callback: (e: FlipEvent) => void): PageFlip;
    off(event: string): void;
    destroy(): void;
  }
}
