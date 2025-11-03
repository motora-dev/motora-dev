'use client';
import { Plus, GripVertical } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

import { Button } from '$shared/ui/button';

import type { Editor } from '@tiptap/react';

interface BlockGutterProps {
  editor: Editor;
}

/**
 * ブロックごとの左側に表示されるボタンエリア
 * 各ブロック（段落、見出しなど）の左側にホバー時に「+」ボタンと「⋮」ボタンを表示
 */
export function BlockGutter({ editor }: BlockGutterProps) {
  const gutterRef = useRef<HTMLDivElement | null>(null);
  const hoveredBlockRef = useRef<HTMLElement | null>(null);
  const buttonsRef = useRef<HTMLDivElement | null>(null);

  const getBlockElement = useCallback(
    (element: HTMLElement): HTMLElement | null => {
      // ProseMirrorのブロック要素を取得
      // p, h1-h6, li, blockquote, pre, hr などがブロック要素
      const blockElements = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE', 'HR'];
      let current: HTMLElement | null = element;

      while (current && current !== editor.view.dom) {
        if (blockElements.includes(current.tagName)) {
          return current;
        }
        current = current.parentElement;
      }

      return null;
    },
    [editor],
  );

  const getBlockAtYPosition = useCallback(
    (y: number): HTMLElement | null => {
      const editorDom = editor.view.dom;
      const editorContainer = gutterRef.current?.parentElement;

      if (!editorContainer) return null;

      const containerRect = editorContainer.getBoundingClientRect();
      const relativeY = y - containerRect.top;

      // エディタ内の要素を走査して、y座標に対応するブロックを探す
      const blockElements = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE', 'HR'];
      const allBlocks = Array.from(editorDom.querySelectorAll(blockElements.join(', '))) as HTMLElement[];

      for (const block of allBlocks) {
        const blockRect = block.getBoundingClientRect();
        const blockTop = blockRect.top - containerRect.top;
        const blockBottom = blockTop + blockRect.height;

        if (relativeY >= blockTop && relativeY <= blockBottom) {
          return block;
        }
      }

      return null;
    },
    [editor],
  );

  const getBlockPosition = useCallback(
    (blockElement: HTMLElement) => {
      const editorDom = editor.view.dom;
      const editorContainer = gutterRef.current?.parentElement;

      if (!editorContainer) {
        return { top: 0, height: 0 };
      }

      const containerRect = editorContainer.getBoundingClientRect();
      const blockRect = blockElement.getBoundingClientRect();

      // コンテナからの相対位置を計算（スクロールは考慮しない）
      const relativeTop = blockRect.top - containerRect.top;

      return {
        top: relativeTop,
        height: blockRect.height,
      };
    },
    [editor],
  );

  const updateButtonsPosition = useCallback(() => {
    if (!hoveredBlockRef.current || !buttonsRef.current) return;

    const position = getBlockPosition(hoveredBlockRef.current);
    const buttons = buttonsRef.current;

    buttons.style.top = `${position.top}px`;
    buttons.style.height = `${position.height}px`;
  }, [getBlockPosition]);

  const showButtons = useCallback(
    (blockElement: HTMLElement) => {
      if (!gutterRef.current || !buttonsRef.current) return;

      const position = getBlockPosition(blockElement);
      const buttons = buttonsRef.current;

      buttons.style.top = `${position.top}px`;
      buttons.style.height = `${position.height}px`;
      buttons.style.opacity = '1';
      buttons.style.pointerEvents = 'auto';

      hoveredBlockRef.current = blockElement;
    },
    [getBlockPosition],
  );

  const hideButtons = useCallback(() => {
    if (!buttonsRef.current) return;

    const buttons = buttonsRef.current;
    buttons.style.opacity = '0';
    buttons.style.pointerEvents = 'none';

    hoveredBlockRef.current = null;
  }, []);

  const handleAddBlock = useCallback(() => {
    if (!editor || !hoveredBlockRef.current) return;

    const blockElement = hoveredBlockRef.current;
    const pos = editor.view.posAtDOM(blockElement, 0);

    if (pos === null || pos === undefined) return;

    // ブロックの下に新しい段落を追加
    // ブロックの終端位置を取得
    const blockEnd = editor.view.posAtDOM(blockElement, blockElement.childNodes.length);
    if (blockEnd === null || blockEnd === undefined) return;

    editor.chain().focus().setTextSelection(blockEnd).insertContent('<p></p>').run();

    hideButtons();
  }, [editor, hideButtons]);

  const handleDeleteBlock = useCallback(() => {
    if (!editor || !hoveredBlockRef.current) return;

    const blockElement = hoveredBlockRef.current;
    const pos = editor.view.posAtDOM(blockElement, 0);

    if (pos === null || pos === undefined) return;

    // ブロック全体を削除
    const blockEnd = editor.view.posAtDOM(blockElement, blockElement.childNodes.length);
    if (blockEnd === null || blockEnd === undefined) return;

    editor.chain().focus().setTextSelection({ from: pos, to: blockEnd }).deleteSelection().run();

    hideButtons();
  }, [editor, hideButtons]);

  useEffect(() => {
    if (!editor) return;

    const editorDom = editor.view.dom;
    const gutter = gutterRef.current;
    const buttons = buttonsRef.current;
    const editorContainer = gutter?.parentElement;

    if (!gutter || !buttons || !editorContainer) return;

    let isMouseOverButtons = false;
    let hideTimeout: ReturnType<typeof setTimeout> | null = null;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const clearHideTimeout = () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      const target = e.target as HTMLElement;

      // ボタン自体にマウスがある場合は何もしない
      if (buttons.contains(target)) {
        clearHideTimeout();
        return;
      }

      // ボタンエリア（gutter）内でのマウス移動
      if (gutter.contains(target)) {
        clearHideTimeout();
        const blockElement = getBlockAtYPosition(e.clientY);
        if (blockElement && blockElement !== hoveredBlockRef.current) {
          showButtons(blockElement);
        }
        return;
      }

      if (!target || !editorDom.contains(target)) {
        if (!isMouseOverButtons) {
          clearHideTimeout();
          hideTimeout = setTimeout(() => {
            hideButtons();
          }, 150);
        }
        return;
      }

      clearHideTimeout();
      const blockElement = getBlockElement(target);
      if (blockElement && blockElement !== hoveredBlockRef.current) {
        showButtons(blockElement);
      } else if (!blockElement) {
        // ブロック要素が見つからない場合は非表示
        if (!isMouseOverButtons) {
          clearHideTimeout();
          hideTimeout = setTimeout(() => {
            hideButtons();
          }, 150);
        }
      }
    };

    const handleMouseEnterButtons = () => {
      isMouseOverButtons = true;
      clearHideTimeout();
    };

    const handleMouseLeaveButtons = () => {
      isMouseOverButtons = false;
      // ボタンエリアから離れた時、少し遅延してから非表示にする
      clearHideTimeout();
      hideTimeout = setTimeout(() => {
        // マウスがエディタ内またはボタンエリア内にあるか確認
        const elementAtPoint = document.elementFromPoint(lastMouseX, lastMouseY);
        if (!elementAtPoint || (!editorDom.contains(elementAtPoint) && !gutter.contains(elementAtPoint))) {
          hideButtons();
        }
      }, 150);
    };

    const handleMouseLeave = () => {
      // エディタから離れた時、ボタンエリアにマウスがあるか確認
      clearHideTimeout();
      hideTimeout = setTimeout(() => {
        if (!isMouseOverButtons) {
          hideButtons();
        }
      }, 150);
    };

    editorDom.addEventListener('mousemove', handleMouseMove);
    editorDom.addEventListener('mouseleave', handleMouseLeave);
    gutter.addEventListener('mousemove', handleMouseMove);
    gutter.addEventListener('mouseenter', handleMouseEnterButtons);
    gutter.addEventListener('mouseleave', handleMouseLeaveButtons);

    // スクロール時にボタンの位置を更新
    const handleScroll = () => {
      if (hoveredBlockRef.current) {
        updateButtonsPosition();
      }
    };

    // スクロール可能な要素を探す（エディタコンテナまたは親要素）
    let scrollableElement: Element | null = editorContainer;
    while (scrollableElement && scrollableElement !== document.body) {
      const overflow = window.getComputedStyle(scrollableElement).overflow;
      if (overflow === 'auto' || overflow === 'scroll') {
        break;
      }
      scrollableElement = scrollableElement.parentElement;
    }

    if (scrollableElement) {
      scrollableElement.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      clearHideTimeout();
      editorDom.removeEventListener('mousemove', handleMouseMove);
      editorDom.removeEventListener('mouseleave', handleMouseLeave);
      gutter.removeEventListener('mousemove', handleMouseMove);
      gutter.removeEventListener('mouseenter', handleMouseEnterButtons);
      gutter.removeEventListener('mouseleave', handleMouseLeaveButtons);
      if (scrollableElement) {
        scrollableElement.removeEventListener('scroll', handleScroll, true);
      }
    };
  }, [editor, getBlockElement, getBlockAtYPosition, showButtons, hideButtons, updateButtonsPosition]);

  return (
    <div ref={gutterRef} className="absolute -left-10 top-0 w-10 h-full pointer-events-auto z-10">
      <div
        ref={buttonsRef}
        className="absolute flex flex-row items-center justify-center gap-1 transition-opacity duration-200"
        style={{
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded hover:bg-gray-200 dark:hover:bg-gray-700 pointer-events-auto"
          onClick={handleAddBlock}
          aria-label="ブロックを追加"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded hover:bg-gray-200 dark:hover:bg-gray-700 pointer-events-auto"
          onClick={handleDeleteBlock}
          aria-label="ブロックを削除"
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
