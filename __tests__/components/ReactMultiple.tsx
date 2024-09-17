import React from 'react';

interface TestComponentProps {
  // Required primitives
  stringProp: string;
  numberProp: number;
  booleanProp: boolean;
  
  // Optional primitives
  optionalString?: string;
  optionalNumber?: number;
  optionalBoolean?: boolean;
  
  // Other JavaScript primitives
  bigintProp: bigint;
  symbolProp: symbol;
  
  // Optional other primitives
  optionalBigint?: bigint;
  optionalSymbol?: symbol;

  // Arrays of simple objects
  userArray: Array<{ id: number; name: string }>;
  productList: { code: string; price: number }[];

  // Single object props
  address: {
    street: string;
    city: string;
    zipCode: string;
  };

  // Intersections of primitives, enums, literals, and tuples
  colorOrNumber: string & { r: number; g: number; b: number };
  statusOrCode: 'active' | 'inactive' | number;
  mixedTuple: [string, number, boolean] & { length: 3 };

  // Enum
  userRole: 'admin' | 'user' | 'guest';
}

const TestComponent =  ({
  stringProp,
  numberProp,
  booleanProp,
  optionalString,
  optionalNumber,
  optionalBoolean,
  bigintProp,
  symbolProp,
  optionalBigint,
  optionalSymbol,
  userArray,
  productList,
  address,
  colorOrNumber,
  statusOrCode,
  mixedTuple,
  userRole,
}: TestComponentProps) => {
  return (
    <div>
      <h2>Required Primitives:</h2>
      <p>String: {stringProp}</p>
      <p>Number: {numberProp}</p>
      <p>Boolean: {booleanProp.toString()}</p>
      <p>BigInt: {bigintProp.toString()}</p>
      <p>Symbol: {symbolProp.toString()}</p>

      <h2>Optional Primitives:</h2>
      <p>Optional String: {optionalString ?? 'Not provided'}</p>
      <p>Optional Number: {optionalNumber ?? 'Not provided'}</p>
      <p>Optional Boolean: {optionalBoolean?.toString() ?? 'Not provided'}</p>
      <p>Optional BigInt: {optionalBigint?.toString() ?? 'Not provided'}</p>
      <p>Optional Symbol: {optionalSymbol?.toString() ?? 'Not provided'}</p>

      <h2>Arrays of simple objects:</h2>
      <p>User Array: {userArray.map(user => `${user.id}: ${user.name}`).join(', ')}</p>
      <p>Product List: {productList.map(product => `${product.code} - ${product.price}`).join(', ')}</p>

      <h2>Single object props:</h2>
      <p>Address: {address.street}, {address.city}, {address.zipCode}</p>

      <h2>Intersections of primitives, enums, literals, and tuples:</h2>
    </div>
  );
};
export default TestComponent;

export const TestComponent2 = (props: TestComponentProps) => {
  return <div><TestComponent {...props} /></div>;
};

export const TestComponent3: React.FC<TestComponentProps> = (props) => {
  return <div><TestComponent {...props} /></div>;
};
