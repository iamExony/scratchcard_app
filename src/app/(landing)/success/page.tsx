import {Suspense} from 'react';
import SuccessPage from './SuccessPage';


export default function SuccessClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessPage />
    </Suspense>
  );
}