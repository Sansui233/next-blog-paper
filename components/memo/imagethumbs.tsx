import { useEffect, useState } from "react";
import styled from "styled-components";
import { useImageBroswerStore } from "./imagebrowser";


export type TImage = {
  ok: "loading" | "loaded" | "failed";
  index: number;
  src: string;
  alt: string;
  width: number;
  height: number;
}

// parse img markdown. Generated by chatgpt
function parseMarkdownImage(markdownText: string) {
  // 使用正则表达式匹配 Markdown 图像语法
  const imageRegex = /!\[(.*?)\]\((.*?)\)/;
  const match = imageRegex.exec(markdownText);

  if (match) {
    const altText = match[1];
    const imageUrl = match[2];
    return { alt: altText, url: imageUrl };
  } else {
    return null; // 没有找到图像语法
  }
}


export function ImageThumbs({ imgsmd }: {
  imgsmd: string[]
}) {
  const ctx = useImageBroswerStore(state => state)
  const [thumbData, setThumbData] = useState<TImage[]>(new Array(imgsmd.length).fill(1).map((_, index) => (
    { ok: "loading", index, src: "", width: 1, height: 1, alt: "" }
  )))

  // fetch image
  useEffect(() => {
    async function loadImages() {
      const promises: Promise<TImage>[] = imgsmd.map(async (md, index) => {
        const parsed = parseMarkdownImage(md)
        if (!parsed) {
          return { ok: "failed", index, src: "", width: 0, height: 0, alt: "" } as TImage
        }

        const { url, alt } = parsed

        const image = new Image();
        const loadImage = new Promise((resolve, reject) => {
          image.onload = () => resolve(image);
          image.onerror = () => reject({ ok: "failed", index, src: "", width: 0, height: 0, alt })
          image.src = url;
        })

        let rejectObj;

        await loadImage.catch((reason) => { rejectObj = reason })
        if (rejectObj) {
          return rejectObj
        } else {
          return { ok: "loaded", index, src: url, width: image.width, height: image.height, alt } as TImage;
        }
      })

      try {
        const fetchData: TImage[] = await Promise.all(promises);
        setThumbData(fetchData);
      } catch (error) {
        console.error('Error loading images:', error);
      }
    }

    loadImages();

  }, [imgsmd, setThumbData])

  if (imgsmd.length === 0) return null

  return <>
    {imgsmd.length === 1

      // only one Image
      ? <div style={{ height: "250px" }}>
        <ImageContainer style={{
          maxWidth: "100%",
          height: "100%", // 为防止样式shift，底部留空和糟糕的小图体验得选一个，我选了后者
          aspectRatio: thumbData[0]
            ? thumbData[0].width / thumbData[0].height > 2.5 // 宽图比例限制
              ? 2.5 : thumbData[0].width / thumbData[0].height < 0.75 // 长图比例限制
                ? 0.75 : thumbData[0].width / thumbData[0].height // 比例正常的的图
            : 2, // 没图……？
        }}>
          {/*eslint-disable-next-line @next/next/no-img-element*/} {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img loading="lazy" src={thumbData[0]?.ok === "loaded" ? thumbData[0]?.src : ""} alt={thumbData[0]?.ok} />
          <ClickMask onClick={e => {
            e.stopPropagation()
            ctx.setCurrentIndex(0)
            ctx.setImagesData(thumbData)
            ctx.setisModel(true)
          }} />
        </ImageContainer></div>

      // two or more images
      : <ImageGrid>
        {thumbData.map((img, i) => {
          return (
            <ImageContainer key={i} onTouchEnd={e => { e.stopPropagation() }} >
              {/*eslint-disable-next-line @next/next/no-img-element*/} {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img loading="lazy" src={img.ok === "loaded" ? img.src : ""} alt={img.ok} />
              <ClickMask onClick={e => {
                e.stopPropagation()
                // console.debug("% click on", i)
                ctx.setCurrentIndex(i)
                ctx.setImagesData(thumbData)
                ctx.setisModel(true)
              }} />
            </ImageContainer>)
        })}
      </ImageGrid>}
  </>
}

// ban press on safari for object-fit not work well
const ClickMask = styled.div`
  position: absolute;
  top:0;
  left:0;
  width: 100%;
  height: 100%;
`

const ImageContainer = styled.div`
  border-radius: 0.5rem;
  background: ${p => p.theme.colors.bg2};
  position: relative;
  overflow: hidden;
  aspect-ratio: 1;
  cursor: zoom-in;
  
  user-select:none;
  -webkit-user-select:none;

  & img {
    position: absolute;
    -o-object-fit: cover;
    object-fit: cover;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  & img:after {
    content: attr(alt);
    background: ${p => p.theme.colors.bg2};
    color: ${p => p.theme.colors.uiLineGray};
    font-weight: bold;
    display: block;
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
    text-align: left;
    padding: 1em;
    word-break: break-all;
  }
`

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;

  @media screen and (max-width: 580px) {
    grid-template-columns: repeat(3, 1fr);
  }

` 