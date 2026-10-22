"use client";

import type { Comment, Story } from "./data";
import type { UserProfile } from "./Onboarding";
import StoryDetail from "./StoryDetail";
import type { Tab } from "./Screens";

export default function ReaderFlow({
  story,
  profile,
  category,
  roseGiven,
  comments,
  commentsLocked,
  onGiveRose,
  onAddComment,
  onNext,
  onBack,
  onEnd,
  onReport,
}: {
  story: Story;
  index: number;
  total: number;
  profile: UserProfile;
  category: Tab;
  roseGiven: boolean;
  comments: Comment[];
  commentsLocked: boolean;
  onGiveRose: (id: string) => void;
  onAddComment: (id: string, comment: Comment) => void;
  onNext: () => void;
  onBack: () => void;
  onEnd: () => void;
  onReport: (id: string) => void;
}) {
  return (
    <StoryDetail
      story={story}
      category={category}
      profileName={profile.name}
      profileInitials={profile.initials}
      roseGiven={roseGiven}
      comments={comments}
      commentsLocked={commentsLocked}
      onGiveRose={() => onGiveRose(story.id)}
      onAddComment={(comment) => onAddComment(story.id, comment)}
      onBack={onBack}
      onNext={onNext}
      onBreak={onEnd}
      onReport={() => onReport(story.id)}
      progressLabel={category === "turned" ? "Clearing up" : category === "vent" ? "Rainy day" : "Little wins"}
    />
  );
}
