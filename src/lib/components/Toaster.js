import React, { useReducer, useCallback } from 'react';
import uuidv4 from 'uuid/v4';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';

import Toast from './Toast';
import ToastReducer from '../ToasterReducer';
import {
  ADD_TOAST,
  REMOVE_TOAST,
  UPDATE_ALL,
  TYPE,
  POSITION,
  TRANSITION_TYPE,
  UPDATE_TOAST,
  UPDATE_SOME
} from '../constants';
import '../styles/Toaster.css';

const Toaster = ({ children, context }) => {
  const ToasterContext = context;
  const [toastContainerList, dispatch] = useReducer(ToastReducer, []);

  const buildToast = (content, options) => {
    let position = {};
    if (!options || !options.position) {
      position = { position: POSITION.BOTTOM_RIGHT };
    } else if (
      !Object.values(POSITION).includes(options.position) &&
      !(typeof options.position === 'object')
    ) {
      throw new TypeError('Position Property Is Invalid!');
    }
    const newToast = {
      ...{ id: uuidv4(), content },
      ...options,
      ...position
    };

    dispatch({ type: ADD_TOAST, payload: newToast });

    return newToast.id;
  };

  buildToast.TYPE = TYPE;
  buildToast.POSITION = POSITION;
  buildToast.TRANSITION_TYPE = TRANSITION_TYPE;
  buildToast.update = (id, updates) => updateToast(id, updates);
  buildToast.updateAll = updates => updateAll(updates);
  buildToast.dismiss = id => dissmiss(id);
  buildToast.dismissAll = () => dissmissAll();
  buildToast.updateSome = updateList => updateSome(updateList);
  const removeToast = toast => {
    dispatch({ type: REMOVE_TOAST, payload: toast });
  };

  const dissmiss = toastId => {
    updateToast(toastId, { triggerIn: false });
  };

  const dissmissAll = () => updateAll({ triggerIn: false });

  const updateAll = updates => {
    dispatch({ type: UPDATE_ALL, payload: updates });
  };

  const updateToast = (id, updates) => {
    dispatch({ type: UPDATE_TOAST, payload: { id, ...updates } });
  };

  const updateSome = updateList => {
    dispatch({ type: UPDATE_SOME, payload: updateList });
  };

  const renderToasts = toastList =>
    toastList.map(toast => (
      <Toast key={toast.id} onExited={() => removeToast(toast)} {...toast} />
    ));

  const renderContainers = () =>
    toastContainerList.map(toastContainer => {
      if (typeof toastContainer.position === 'object') {
        return (
          <ul
            key={toastContainer.id}
            className="_toaster"
            style={toastContainer.position}
          >
            {renderToasts(toastContainer.toasts)}
          </ul>
        );
      }

      return (
        <ul
          key={toastContainer.id}
          className={classNames('_toaster', toastContainer.position)}
        >
          {renderToasts(toastContainer.toasts)}
        </ul>
      );
    });

  return (
    <ToasterContext.Provider value={useCallback(buildToast, [])}>
      <React.Fragment>
        {children}
        {renderContainers()}
      </React.Fragment>
    </ToasterContext.Provider>
  );
};

Toaster.propTypes = {
  children: PropTypes.node,
  context: PropTypes.object.isRequired
};

export default React.memo(Toaster);
