import { storyTitle, type StoryId, type StyleId } from "@shared/books/catalog";
import { coverUsesLightTitle, illustrationPath } from "@shared/books/illustrations";
import { sampleFor } from "@shared/books/story";

export function SceneArt({ story, beat, label, priority = false }: { story: StoryId; beat: number; label?: string; priority?: boolean }) {
  return (
    <img className="story-art" src={illustrationPath(story, beat)} alt={label ?? ""} width={640} height={640}
      loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" />
  );
}

export function GalleryArt({ style, label }: { style: StyleId; label?: string }) {
  return <img className="story-art" src={`/books-art/styles/${style}.jpg`} alt={label ?? ""} width={640} height={640} loading="lazy" decoding="async" />;
}

export function Cover({ story, name, label }: { story: StoryId; name?: string; label?: string }) {
  const sample = sampleFor(story);
  const shown = (name ?? sample.child.name).trim() || "Your child";
  const title = storyTitle(story, shown);
  const rest = title.slice(shown.length).trim();
  const size = Math.min(14.8, 75 / Math.max(4, shown.length * 0.62));
  const lightTitle = coverUsesLightTitle(story);
  return (
    <div className={lightTitle ? "cover cover-light-title" : "cover"} role={label === "" ? undefined : "img"}
      aria-label={label === "" ? undefined : label ?? `Cover: ${title}`} aria-hidden={label === "" || undefined}>
      <div className="cover-art"><SceneArt story={story} beat={0} /></div>
      <div className="cover-title" aria-hidden="true">
        <span className="cover-name" style={{ fontSize: `${size}cqw` }}>{shown}</span>
        <span className="cover-rest">{rest}</span>
      </div>
    </div>
  );
}
