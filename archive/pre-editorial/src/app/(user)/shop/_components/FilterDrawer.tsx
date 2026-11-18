import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { IoOptionsOutline } from 'react-icons/io5';
import Filter from './Filter';

const FilterDrawer = () => (
  <Drawer>
    <DrawerTrigger asChild>
      <Button variant="street-outline" size="sm" className="shrink-0 gap-1.5 lg:hidden">
        <IoOptionsOutline size={16} />
        FILTER
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <div className="mx-auto w-full max-w-sm">
        <DrawerHeader>
          <DrawerTitle className="display tracking-widest">FILTER</DrawerTitle>
        </DrawerHeader>
        <div className="flex min-h-80 flex-col gap-4 px-4 py-4">
          <Filter />
        </div>
        <DrawerFooter>
          {/* 필터는 선택 즉시 적용되므로 닫기 동작만 필요하다 */}
          <DrawerClose asChild>
            <Button variant="volt">적용</Button>
          </DrawerClose>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
);

export default FilterDrawer;
