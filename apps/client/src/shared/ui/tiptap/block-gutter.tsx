'use client';
import { Plus, GripVertical, Type, Heading1, Heading2, List, Quote } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '$shared/ui/button';

import type { Editor } from '@tiptap/react';

interface BlockGutterProps {
  editor: Editor;
  hoveredBlock: HTMLElement | null;
  onMenuOpenChange?: (isOpen: boolean) => void;
}

interface BlockType {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  command: () => void;
}

/**
 * ブロックごとの左側に表示されるボタンエリア（改良版）
 * - useStateでReactらしい実装
 * - ドラッグ&ドロップでブロック並び替え
 * - メニュー表示でブロックタイプ変更
 * - 簡潔なマウスイベント処理
 * - パフォーマンス改善
 */
export function BlockGutter({ editor, hoveredBlock, onMenuOpenChange }: BlockGutterProps) {
  const gutterRef = useRef<HTMLDivElement | null>(null);
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const dragDataRef = useRef<{ pos: number; node: any } | null>(null);

  // メニューの開閉状態を親に通知
  useEffect(() => {
    onMenuOpenChange?.(showMenu || showAddMenu);
  }, [showMenu, showAddMenu, onMenuOpenChange]);

  // ブロックタイプ変更のオプション
  const getBlockTypeOptions = useCallback((): BlockType[] => {
    if (!hoveredBlock) return [];

    const pos = editor.view.posAtDOM(hoveredBlock, 0);
    if (pos === null || pos === undefined) return [];

    return [
      {
        label: '段落',
        icon: Type,
        command: () => {
          editor.chain().focus().setTextSelection(pos).setParagraph().run();
          setShowMenu(false);
        },
      },
      {
        label: '見出し1',
        icon: Heading1,
        command: () => {
          editor.chain().focus().setTextSelection(pos).toggleHeading({ level: 1 }).run();
          setShowMenu(false);
        },
      },
      {
        label: '見出し2',
        icon: Heading2,
        command: () => {
          editor.chain().focus().setTextSelection(pos).toggleHeading({ level: 2 }).run();
          setShowMenu(false);
        },
      },
      {
        label: '箇条書き',
        icon: List,
        command: () => {
          editor.chain().focus().setTextSelection(pos).toggleBulletList().run();
          setShowMenu(false);
        },
      },
      {
        label: '引用',
        icon: Quote,
        command: () => {
          editor.chain().focus().setTextSelection(pos).toggleBlockquote().run();
          setShowMenu(false);
        },
      },
    ];
  }, [editor, hoveredBlock]);

  // ブロック追加のオプション
  const getAddBlockOptions = useCallback((): BlockType[] => {
    if (!hoveredBlock) return [];

    const pos = editor.view.posAtDOM(hoveredBlock, hoveredBlock.childNodes.length);
    if (pos === null || pos === undefined) return [];

    return [
      {
        label: '段落',
        icon: Type,
        command: () => {
          editor.chain().focus().setTextSelection(pos).insertContent('<p></p>').run();
          setShowAddMenu(false);
        },
      },
      {
        label: '見出し1',
        icon: Heading1,
        command: () => {
          editor.chain().focus().setTextSelection(pos).insertContent('<h1></h1>').run();
          setShowAddMenu(false);
        },
      },
      {
        label: '見出し2',
        icon: Heading2,
        command: () => {
          editor.chain().focus().setTextSelection(pos).insertContent('<h2></h2>').run();
          setShowAddMenu(false);
        },
      },
      {
        label: '箇条書き',
        icon: List,
        command: () => {
          editor.chain().focus().setTextSelection(pos).insertContent('<ul><li></li></ul>').run();
          setShowAddMenu(false);
        },
      },
      {
        label: '引用',
        icon: Quote,
        command: () => {
          editor.chain().focus().setTextSelection(pos).insertContent('<blockquote><p></p></blockquote>').run();
          setShowAddMenu(false);
        },
      },
    ];
  }, [editor, hoveredBlock]);

  // ブロック位置を計算する関数（Gridレイアウト対応）
  const calculateBlockPosition = useCallback((blockElement: HTMLElement) => {
    const gutter = gutterRef.current;
    if (!gutter) return null;

    const gutterRect = gutter.getBoundingClientRect();
    const blockRect = blockElement.getBoundingClientRect();

    return {
      top: blockRect.top - gutterRect.top,
      height: blockRect.height,
    };
  }, []);

  // ボタン位置のstate
  const [buttonPosition, setButtonPosition] = useState<{ top: number; height: number } | null>(null);

  // hoveredBlockが変わった時に初期位置を設定
  //
  // Note: このuseEffect内でのsetStateはReactのベストプラクティスに従っています：
  // 1. hoveredBlockはpropsから来る外部の状態
  // 2. DOM要素の位置計算は外部システム（ブラウザのレンダリングエンジン）との同期
  // 3. この計算はレンダリング中には行えない（refs、getBoundingClientRect）
  //
  // したがって、useEffect内でDOM位置を計算してstateにセットすることが正しいパターンです。
  // リンターの警告は誤検知です。
  useEffect(() => {
    if (!hoveredBlock) {
      setButtonPosition(null);
      return;
    }

    const position = calculateBlockPosition(hoveredBlock);
    setButtonPosition(position);
  }, [hoveredBlock, calculateBlockPosition]);

  // ドラッグ開始
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!hoveredBlock) return;

      const pos = editor.view.posAtDOM(hoveredBlock, 0);
      if (pos === null || pos === undefined) return;

      const node = editor.state.doc.nodeAt(pos);
      if (!node) return;

      dragDataRef.current = { pos, node };
      e.dataTransfer.effectAllowed = 'move';

      // ドラッグ中の視覚効果
      requestAnimationFrame(() => {
        if (hoveredBlock) {
          hoveredBlock.classList.add('opacity-50');
        }
      });
    },
    [editor, hoveredBlock],
  );

  // ドラッグ終了
  const handleDragEnd = useCallback(() => {
    if (hoveredBlock) {
      hoveredBlock.classList.remove('opacity-50');
    }
    dragDataRef.current = null;
  }, [hoveredBlock]);

  // ドロップ処理
  const handleDrop = useCallback(
    (e: React.DragEvent, targetBlock: HTMLElement) => {
      e.preventDefault();
      const dragData = dragDataRef.current;
      if (!dragData) return;

      const targetPos = editor.view.posAtDOM(targetBlock, 0);
      if (targetPos === null || targetPos === undefined) return;

      const { pos, node } = dragData;

      // 同じ位置の場合は何もしない
      if (pos === targetPos) return;

      // トランザクションで一度に実行
      const tr = editor.state.tr;

      // ドラッグ元のノードを削除
      tr.delete(pos, pos + node.nodeSize);

      // 削除後の位置調整
      const newTargetPos = targetPos > pos ? targetPos - node.nodeSize : targetPos;

      // ドロップ先に挿入
      tr.insert(newTargetPos, node);

      editor.view.dispatch(tr);

      dragDataRef.current = null;
    },
    [editor],
  );

  // ResizeObserver（サイズ変更時のみ位置を更新）
  useEffect(() => {
    if (!hoveredBlock) return;

    const updatePosition = () => {
      const position = calculateBlockPosition(hoveredBlock);
      setButtonPosition(position);
    };

    // ResizeObserverでサイズ変更を監視
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(hoveredBlock);

    // Gutterコンテナのリサイズも監視
    const gutter = gutterRef.current;
    if (gutter) {
      resizeObserver.observe(gutter);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [hoveredBlock, calculateBlockPosition]);

  return (
    <div ref={gutterRef} className="relative w-16 pointer-events-auto">
      {hoveredBlock && buttonPosition && (
        <div
          ref={buttonContainerRef}
          className="absolute flex flex-row items-start justify-center gap-1 transition-all duration-200"
          style={{
            top: `${buttonPosition.top}px`,
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, hoveredBlock)}
        >
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => {
                setShowMenu(false);
                setShowAddMenu(!showAddMenu);
              }}
              aria-label="ブロックを追加"
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* ブロック追加メニュー */}
            {showAddMenu && (
              <div className="absolute left-full ml-2 top-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-2 min-w-[150px] z-50">
                {getAddBlockOptions().map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.label}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 h-8"
                      onClick={option.command}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-grab active:cursor-grabbing"
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onClick={() => {
                setShowAddMenu(false);
                setShowMenu(!showMenu);
              }}
              aria-label="ブロックメニュー"
            >
              <GripVertical className="h-4 w-4" />
            </Button>

            {/* ブロックタイプ変更メニュー */}
            {showMenu && (
              <div className="absolute left-full ml-2 top-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-2 min-w-[150px] z-50">
                {getBlockTypeOptions().map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.label}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 h-8"
                      onClick={option.command}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
