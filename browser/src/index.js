/* eslint-disable no-unused-vars*/
import React from 'react';
import ReactDOM from 'react-dom';
import Zipper from './Zipper'

const zipperStyle = {
  backgroundColor: '#ededed',
  zipperColor: '#2d2d2d',
  teethColor: '#2d2d2d'
};

ReactDOM.render(
  <Zipper
    numTeeth={25}
    message="Boo!"
    startUnzipped={ true }
    style={ zipperStyle }/>,
  document.getElementById('app')
);
