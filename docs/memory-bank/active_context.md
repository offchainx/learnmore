# Active Context

## Current Focus
Story-008: Video Player Integration

## Goals
- Integrate `react-player` component.
- Implement Server Action `getSignedVideoUrl(lessonId)`.
- Implement basic player controls (play/pause/speed/fullscreen).
- Handle HLS streaming (optional).

## Recent Changes
- Story 020 (Profile & Settings) has been completed and archived.

## Next Steps
1. Install `react-player`.
2. Create Server Action `getSignedVideoUrl` in `src/actions/storage.ts` (or similar).
3. Implement Video Player component in `src/components/business/VideoPlayer.tsx`.
4. Integrate Video Player into Lesson View.
