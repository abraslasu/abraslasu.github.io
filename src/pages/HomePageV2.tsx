import KoiPond from '../components/KoiPond';

export default function HomePageV2() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#d7e8f4] cursor-default select-none touch-manipulation">
      <KoiPond className="absolute inset-0 block h-full w-full" />
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center text-center text-[21px] leading-[1.5] text-[#3a4352]">
        <p className="font-medium">Andie</p>
        <p>Dynamically designing</p>
      </div>
    </div>
  );
}
