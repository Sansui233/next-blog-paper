import { Search } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useEffect, useRef, useState } from "react"
import styled from "styled-components"
import Neko from "../../../assets/neko.svg"
import { throttle } from "../../../lib/throttle"
import { siteInfo } from "../../../site.config"
import { LinkWithLine } from "../../../styles/components/link-with-line"
import { hoverRound } from "../../../styles/styles"
import MenuIcon from "./menuicon"
import Sidebar from "./sidebar"

type Props = React.HTMLProps<HTMLElement> & {
  placeHolder?: boolean; // 有一些布局不需要 placeHolder
  scrollElem?: HTMLElement; // 滚动时自动隐藏的监听元素，默认是GlobalThis
  hideSearch?: boolean;
}

const LazySearchBox = dynamic(() => import('../searchbox'), {})

export default function Topbar({ placeHolder = true, scrollElem, hideSearch, ...otherProps }: Props) {
  const [isHidden, setisHidden] = useState(false)
  const [isSidebar, setIsSidebar] = useState(false)
  const [isSearch, setisSearch] = useState(false)
  const router = useRouter()
  const searchIcon = useRef<HTMLDivElement>(null)

  /**
   * Hide on scroll
   */
  useEffect(() => {

    let elem: HTMLElement | typeof globalThis = globalThis;

    if (scrollElem) {
      elem = scrollElem
      elem.scrollTop
    }


    // 不要问我单独写这个，因为tsc抽风，需要if后推断具体类型经常报错。
    const getScrollPos = () => {
      if (scrollElem && scrollElem instanceof HTMLElement) {
        return scrollElem.scrollTop
      } else {
        return globalThis.scrollY
      }
    }

    let previousTop = getScrollPos()

    const onScroll: EventListener = () => { // <-- DOM-EventListener
      if (getScrollPos() < 200) { // ignore on page top
        setisHidden(false)
        previousTop = getScrollPos()
        return
      }

      const distance = getScrollPos() - previousTop

      if (distance > 10) {
        setisHidden(true)
        previousTop = getScrollPos()
      } else if (distance < -10) {
        setisHidden(false)
        previousTop = getScrollPos()
      }
    };

    const throttled = throttle(onScroll, 100)
    elem.addEventListener("scroll", throttled);


    return () => {
      elem.removeEventListener("scroll", throttled)
    };
  }, [scrollElem])

  const toggleSidebar = () => {
    setIsSidebar(!isSidebar)
  }

  const clickSearch = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setisSearch(!isSearch)
  }

  const updateSearch = (innerState: boolean) => {
    setisSearch(innerState)
  }

  return (
    <React.Fragment>
      <LazySearchBox outSetSearch={updateSearch} outIsShow={isSearch} iconEle={searchIcon} />
      <Sidebar isShow={isSidebar} toggle={toggleSidebar} />
      <Layout $isHidden={isHidden} {...otherProps}>
        <Avatar >
          <Link href="/" passHref={true} style={{ padding: "0 1rem" }}>
            {/*eslint-disable-next-line @next/next/no-img-element*/}
            <Neko width="36" />
            <span>{`${siteInfo.author}'s 's blog`}</span>
          </Link>
        </Avatar>
        <Nav>
          <ol className={router.pathname === "/" ? 'current' : ''}><LinkWithLine href="/">Posts</LinkWithLine></ol>
          <ol className={router.pathname === "/memos" ? 'current' : ''}><LinkWithLine href="/memos">Memos</LinkWithLine></ol>
          <ol className={router.pathname === "/about" ? 'current' : ''}><LinkWithLine href="/about">About</LinkWithLine></ol>
        </Nav>
        <More >
          <SearchIcon ref={searchIcon} onClick={(e) => { hideSearch ? null : clickSearch(e) }} $isSearch={isSearch} $hideSearch={hideSearch}>
            <Search />
          </SearchIcon>
          <div onClick={toggleSidebar} style={{ marginRight: "20px", width: "22px" }}>
            <MenuIcon width={"100%"} height={"1.15rem"} isClose={isSidebar} />
          </div>
        </More>
      </Layout>
      {placeHolder === false ? null : <PlaceHolder>
        人活着就是为了卡卡西
      </PlaceHolder>}
    </React.Fragment>
  );
}

const SearchIcon = styled.div<{ $isSearch: boolean, $hideSearch: boolean | undefined }>`
  ${p => p.$hideSearch && "display: none;"}
  ${p => p.$isSearch ? "color:" + p.theme.colors.accent + ";" : ""}
  transition: color 0.3s ease;
  cursor: pointer;

  &:hover {
    color: ${p => p.theme.colors.accentHover};
  }

  @media screen and (max-width: 780px) {
    ${p => p.$hideSearch && "display:none;"}
  }

`
const PlaceHolder = styled.div`
    height: 63px;
    width: 100%;
    text-align: center;
    padding-top: 0.625rem;
    font-size: 0.625rem;
    font-style: italic;
    color: ${p => p.theme.colors.accent};
    font-family: 'Times New Roman', STSong, '宋体', serif;
    opacity: .6;
`
const Layout = styled.header<{
  $isHidden: boolean
}>`
  height: 63px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  background-color: ${(props => props.theme.colors.bg)};
  z-index:10;
  transform: ${props => props.$isHidden ? "translateY(-100%)" : "translateY(0)"};
  transition: transform .5s ease;
`

// Common Property to make nav middle aligned
const LeftRight = styled.div`
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: flex-end;

`
const Avatar = styled(LeftRight)`
  flex: 1 1 auto;
  display: flex;
  justify-content: flex-start;
  font-weight: bold;
  width: 210px;

  span {
    padding: 0 0.5rem;
  }

  @media screen and (max-width: 780px){
    width: 100px;
    span {
      display: none;
    }
  }
  @media screen and (max-width: 350px){
    display: none
  }
`

const More = styled(LeftRight)`
  text-align: right;
  font-size: 0.875em;
  width: 210px;
  
  & > div {
    margin-right: 15px;
  }

  @media screen and (max-width: 780px){
    width: 100px;
  }

  @media screen and (max-width: 580px) {
    & > div {
      margin-right: 16px;
      padding: 1px 0;
    }
  }
`
const Nav = styled.nav`
  flex: 2 1 auto;
  display: flex;
  justify-content: space-evenly;
  letter-spacing: 0.02em;
  align-items: center;


  @media screen and (min-width: 780px) {
    max-width: 50%;
  }
  @media screen and (min-width: 580px) {
    max-width: 390px;
  }
  @media screen and (max-width: 580px) {
    max-width: 290px;
  }
  

  ol {
    padding: 0 .5em;
    padding-top: 2px;
  }

  ol.current a{
    position: relative;
  }
  ol.current a:before {
    ${hoverRound}
  }

`