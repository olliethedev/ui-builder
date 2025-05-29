import React from 'react';

export default function SimpleComponent({someString, someNumber, someBoolean}: {someString: string, someNumber: number, someBoolean: boolean}) {
  return <div>
    <p>String prop: {someString}</p>
    <p>Number prop: {someNumber}</p>
    <p>Boolean prop: {someBoolean ? 'True' : 'False'}</p>
  </div>;
}