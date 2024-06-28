/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Collection, Key} from '@react-types/shared';
import {Layout, Rect, ReusableView, useVirtualizerState, VirtualizerState} from '@react-stately/virtualizer';
import {mergeProps} from '@react-aria/utils';
import React, {HTMLAttributes, ReactElement, ReactNode, RefObject, useCallback, useMemo, useRef} from 'react';
import {ScrollView} from './ScrollView';
import {useLoadOnScroll} from '@react-aria/loading';
import {VirtualizerItem} from './VirtualizerItem';

type RenderWrapper<T extends object, V> = (
  parent: ReusableView<T, V> | null,
  reusableView: ReusableView<T, V>,
  children: ReusableView<T, V>[],
  renderChildren: (views: ReusableView<T, V>[]) => ReactElement[]
) => ReactElement;

interface VirtualizerProps<T extends object, V, O> extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  children: (type: string, content: T) => V,
  renderWrapper?: RenderWrapper<T, V>,
  layout: Layout<T, O>,
  collection: Collection<T>,
  focusedKey?: Key,
  sizeToFit?: 'width' | 'height',
  scrollDirection?: 'horizontal' | 'vertical' | 'both',
  isLoading?: boolean,
  onLoadMore?: () => void,
  layoutOptions?: O
}

function Virtualizer<T extends object, V extends ReactNode, O>(props: VirtualizerProps<T, V, O>, ref: RefObject<HTMLDivElement | null>) {
  let {
    children: renderView,
    renderWrapper,
    layout,
    collection,
    sizeToFit,
    scrollDirection,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isLoading,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onLoadMore,
    focusedKey,
    layoutOptions,
    ...otherProps
  } = props;

  let fallbackRef = useRef<HTMLDivElement>(undefined);
  ref = ref || fallbackRef;

  let state = useVirtualizerState({
    layout,
    collection,
    renderView,
    onVisibleRectChange(rect) {
      ref.current.scrollLeft = rect.x;
      ref.current.scrollTop = rect.y;
    },
    persistedKeys: useMemo(() => focusedKey != null ? new Set([focusedKey]) : new Set(), [focusedKey]),
    layoutOptions
  });

  let {virtualizerProps, scrollViewProps} = useVirtualizer(props, state, ref);

  return (
    <ScrollView
      {...mergeProps(otherProps, virtualizerProps, scrollViewProps)}
      ref={ref}
      contentSize={state.contentSize}
      onScrollStart={state.startScrolling}
      onScrollEnd={state.endScrolling}
      sizeToFit={sizeToFit}
      scrollDirection={scrollDirection}>
      {renderChildren(null, state.visibleViews, renderWrapper || defaultRenderWrapper)}
    </ScrollView>
  );
}

interface VirtualizerOptions {
  tabIndex?: number,
  focusedKey?: Key,
  isLoading?: boolean,
  onLoadMore?: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useVirtualizer<T extends object, V extends ReactNode, W>(props: VirtualizerOptions, state: VirtualizerState<T, V>, ref: RefObject<HTMLElement | null>) {
  let {isLoading, onLoadMore} = props;
  let {setVisibleRect} = state;
  let scrollOffset = ref.current?.clientHeight;

  // TODO: The ref previously provided was the table's ref. That ref didn't actually do anything in the old implementation
  // but now the ref provided to useVirtualizer MUST be the scrollable ref so its a breaking change kinda?
  // TODO: Also, now that we use ref.currnet.clientHeight/scrollHeight/etc instead of relying on the rect to figure out if we should load more
  // this will break peoples tests since they need to mock scrollHeight to simulate the virtualizer's total contents height...
  let {scrollViewProps: {onScroll}} = useLoadOnScroll({isLoading, onLoadMore, scrollOffset}, ref);

  let onVisibleRectChange = useCallback((rect: Rect) => {
    setVisibleRect(rect);
    onScroll();
  }, [setVisibleRect, onScroll]);

  // TODO: would've liked it if I didn't have to preseve these and just attach onScroll directly to the scroll ref but it would be breaking.
  return {
    virtualizerProps: {},
    scrollViewProps: {
      onVisibleRectChange
    }
  };
}

// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref
const _Virtualizer = React.forwardRef(Virtualizer) as <T extends object, V, O>(props: VirtualizerProps<T, V, O> & {ref?: RefObject<HTMLDivElement | null>}) => ReactElement;
export {_Virtualizer as Virtualizer};

function renderChildren<T extends object, V>(parent: ReusableView<T, V> | null, views: ReusableView<T, V>[], renderWrapper: RenderWrapper<T, V>) {
  return views.map(view => {
    return renderWrapper(
      parent,
      view,
      view.children ? Array.from(view.children) : [],
      childViews => renderChildren(view, childViews, renderWrapper)
    );
  });
}

function defaultRenderWrapper<T extends object, V extends ReactNode>(
  parent: ReusableView<T, V> | null,
  reusableView: ReusableView<T, V>
) {
  return (
    <VirtualizerItem
      key={reusableView.key}
      layoutInfo={reusableView.layoutInfo}
      virtualizer={reusableView.virtualizer}
      parent={parent?.layoutInfo}>
      {reusableView.rendered}
    </VirtualizerItem>
  );
}
