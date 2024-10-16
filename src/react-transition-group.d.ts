declare module 'react-transition-group' {
    import * as React from 'react';
  
    export class CSSTransition extends React.Component<{
      in: boolean;
      timeout: number;
      classNames: string;
      unmountOnExit?: boolean;
      onEnter?: () => void;
      onEntering?: () => void;
      onEntered?: () => void;
      onExit?: () => void;
      onExiting?: () => void;
      onExited?: () => void;
      children?: React.ReactNode;
    }> {}
  
    export class TransitionGroup extends React.Component<{
      children: React.ReactNode;
    }> {}
  }
  