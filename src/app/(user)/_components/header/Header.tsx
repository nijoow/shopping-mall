import React from 'react';

const Header = () => {
  return (
    <div className="h-14 px-6 items-center gap-4 flex">
      <div className="">LOGO</div>
      <div>SHOP</div>
      <div>TOP</div>
      <div>FEATURES</div>

      <input
        className="w-full max-w-[240px]"
        type="text"
        placeholder="검색어를 입력해주세요."
      />
      <div className="flex-auto" />
      <div>Language</div>
      <div>MYPAGE</div>
      <div>LIKE</div>
      <div>SHOPPINGBAG</div>
      <div>LOGIN</div>
    </div>
  );
};

export default Header;
