import Spinner from '@/components/Spinner';

const FullpageSpinner = () => (
  <div className="fixed left-0 top-0 h-screen w-screen bg-black/40">
    <Spinner fill="white" width={24} className="m-auto" />
  </div>
);

export default FullpageSpinner;
