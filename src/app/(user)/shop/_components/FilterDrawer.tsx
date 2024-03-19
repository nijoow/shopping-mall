import * as React from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import Filter from './Filter';

const FilterDrawer = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="sm:hidden">
          필터
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>필터</DrawerTitle>
          </DrawerHeader>
          <div className="flex min-h-80 flex-col gap-2.5 px-4 py-4">
            <Filter />
          </div>
          <DrawerFooter>
            <Button>적용</Button>
            <DrawerClose asChild>
              <Button variant="outline">닫기</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FilterDrawer;
