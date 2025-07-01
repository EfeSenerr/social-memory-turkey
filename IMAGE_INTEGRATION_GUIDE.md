# Event Images Integration Guide

## Folder Structure
```
public/
  images/
    events/
      TR_001/           # Event ID folder
        photo1.jpg      # Main evidence photo
        photo2.jpg      # Additional evidence
        document.pdf    # Related document
      TR_002/
        scene.jpg
        aftermath.png
      incident-47/      # Use your actual event IDs
        evidence1.jpg
        witness-video.mp4
```

## Data Structure Options

### Option 1: Simple Images Array
Add to your event objects in `tr_events.json`:

```json
{
  "id": "TR_001",
  "description": "Police intervention during peaceful protest...",
  "images": [
    "events/TR_001/photo1.jpg",
    "events/TR_001/photo2.jpg"
  ],
  // ... other fields
}
```

### Option 2: Detailed Media Structure (Recommended)
```json
{
  "id": "TR_001", 
  "description": "Police intervention during peaceful protest...",
  "media": [
    {
      "type": "image",
      "url": "events/TR_001/photo1.jpg",
      "caption": "Police using water cannons against protesters",
      "credit": "Reuters",
      "timestamp": "14:30"
    },
    {
      "type": "image", 
      "url": "events/TR_001/photo2.jpg",
      "caption": "Injured protester receiving medical aid",
      "credit": "AP News"
    },
    {
      "type": "video",
      "url": "events/TR_001/witness-video.mp4", 
      "caption": "Live footage from witness",
      "credit": "Social Media"
    }
  ],
  // ... other fields
}
```

## Implementation Steps

1. **Create folder structure**: Make `public/images/events/` folder
2. **Organize images**: Create subfolders for each event ID
3. **Update JSON data**: Add image/media fields to your events
4. **Upload images**: Place images in the appropriate event folders
5. **Test**: The DataTable will automatically display images when you expand event rows

## Best Practices

1. **Image Naming**: Use descriptive names like `evidence1.jpg`, `scene-overview.png`
2. **File Formats**: Use web-friendly formats (JPG, PNG, WebP for images; MP4 for videos)
3. **File Size**: Optimize images for web (compress to reasonable sizes)
4. **Security**: Don't include sensitive information in filenames
5. **Backup**: Keep original high-resolution images in a separate archive

## Privacy Considerations

- Be careful with images showing identifiable people
- Consider blurring faces if necessary
- Include proper credits and permissions
- Follow legal requirements for evidence documentation
