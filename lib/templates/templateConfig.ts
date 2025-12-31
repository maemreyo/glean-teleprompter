// Types for script templates
type FontStyle = 'Classic' | 'Modern' | 'Typewriter' | 'Novel' | 'Neon';
type TextAlign = 'left' | 'center';

export interface TeleprompterConfig {
  font: FontStyle;
  colorIndex: number;
  fontSize: number;
  speed: number;
  align: TextAlign;
  lineHeight?: number;
  margin?: number;
  overlayOpacity?: number;
}

export interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'creative' | 'education' | 'blank';
  content: string;
  settings: Partial<TeleprompterConfig>;
  estimatedDuration: number; // seconds
  thumbnail?: string;
  icon?: string;
}

/**
 * Pre-configured script templates for quickstart
 */
export const templates: ScriptTemplate[] = [
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Introduce your new product with impact',
    category: 'business',
    content: `// Product Launch Script Template

[Opening Hook]
In just 2 minutes, I'm going to show you something that will change how you work with video content.

[Problem Statement]
You know how frustrating it is when... (describe the problem your audience faces)

[Solution]
That's why we built... (your product name) - a powerful new way to... (key benefit)

[Demo]
Let me show you how it works...
First, you... (step 1)
Then, simply... (step 2)
And finally... (step 3)

[Key Benefits]
With (product name), you can:
- Benefit 1
- Benefit 2
- Benefit 3

[Call to Action]
Click the link below to get started with your free trial today.

Thanks for watching!`,
    settings: {
      font: 'Modern',
      speed: 2,
      fontSize: 48,
      align: 'center'
    },
    estimatedDuration: 120,
    icon: '🚀'
  },
  {
    id: 'youtube-intro',
    name: 'YouTube Intro',
    description: 'Catchy video intro for your channel',
    category: 'creative',
    content: `// YouTube Intro Template

What's up everyone! Welcome back to the channel.

Today we're talking about something really exciting that I think you're going to love.

Make sure to hit that subscribe button and ring the bell so you never miss an upload.

If you enjoy this video, please give it a thumbs up - it really helps the channel grow.

Let's dive right in!`,
    settings: {
      font: 'Modern',
      speed: 2.5,
      fontSize: 52,
      align: 'center'
    },
    estimatedDuration: 30,
    icon: '📺'
  },
  {
    id: 'podcast-script',
    name: 'Podcast Script',
    description: 'Structured podcast episode outline',
    category: 'creative',
    content: `// Podcast Episode Script

[Intro - 2 min]
Welcome to [Podcast Name]! I'm your host [Your Name], and today we have a really special episode for you.

Before we dive in, a quick reminder to subscribe if you haven't already, and leave us a review - it helps other listeners find the show.

[Episode Topic Teaser]
Today we're exploring... (brief description of topic)

[Sponsor Message - if applicable]
This episode is brought to you by... (sponsor info)

[Main Content - 15-20 min]

Point 1: Explanation and examples
- First key insight
- Example or story
- Practical takeaway

Point 2: Personal story
- My experience with this
- Lessons learned
- How it applies to you

Point 3: Actionable tips
- Tip 1
- Tip 2
- Tip 3

[Listener Question/Call-In]
Now I want to hear from you... (question or prompt)

[Outro - 2 min]
Let's recap what we covered today:
- Key takeaway 1
- Key takeaway 2
- Key takeaway 3

If you enjoyed this episode, please subscribe and leave a review. Follow us on social media at [handles].

Thanks for listening, and we'll catch you in the next episode!`,
    settings: {
      font: 'Typewriter',
      speed: 2,
      fontSize: 44,
      align: 'left'
    },
    estimatedDuration: 1200,
    icon: '🎙️'
  },
  {
    id: 'presentation-notes',
    name: 'Presentation Notes',
    description: 'Speaker notes for your presentation',
    category: 'business',
    content: `// Presentation Notes Template

[Slide 1: Title]
- Welcome everyone, thank you for being here
- Introduce yourself briefly
- State the presentation goal
- Outline what we'll cover

[Slide 2: Agenda]
- Cover the three main points we'll discuss
- Mention the timing
- Let them know Q&A will be at the end

[Slide 3: Point 1 - Introduction]
- Explain the concept clearly
- Give a concrete example
- Transition to the next point

[Slide 4: Point 2 - Details]
- Go deeper into the topic
- Share data or research
- Use a personal story if relevant

[Slide 5: Point 3 - Application]
- How to apply this information
- Practical steps they can take
- Resources for further learning

[Slide 6: Case Study - Optional]
- Real-world example
- Results achieved
- Key lessons

[Slide 7: Summary]
- Recap the three main points
- Emphasize the most important takeaway
- Connect back to the opening goal

[Slide 8: Call to Action / Next Steps]
- What should they do now?
- How can they learn more?
- Contact information

[Closing]
- Thank you for your attention
- Open it up for questions`,
    settings: {
      font: 'Classic',
      speed: 1.5,
      fontSize: 40,
      align: 'left'
    },
    estimatedDuration: 600,
    icon: '📊'
  },
  {
    id: 'tutorial-script',
    name: 'Tutorial Script',
    description: 'Step-by-step instructional content',
    category: 'education',
    content: `// Tutorial Script Template

[Introduction]
Hi there! In this tutorial, I'm going to show you how to... (main topic).

By the end of this video, you'll be able to... (learning outcome).

Let's get started!

[Prerequisites - 30 seconds]
Before we begin, you'll need:
- Requirement 1
- Requirement 2
- Requirement 3

[Step 1 - First Action]
First, let's... (describe first action)
(Demonstrate while speaking)
You'll notice that... (point out what's happening)

[Step 2 - Second Action]
Next, we're going to... (describe second action)
(Demonstrate)
This is important because... (explain why)

[Step 3 - Third Action]
Now for the third step... (describe)
(Demonstrate)
Here's a pro tip... (optional tip)

[Troubleshooting - Optional]
If you run into any issues:
- Problem 1 solution
- Problem 2 solution

[Putting It Together]
Now let's see how it all works together...
(Demonstrate complete process)

[Conclusion]
And that's how you... (main topic)!

To recap:
- Point 1
- Point 2
- Point 3

If you found this helpful, please give it a thumbs up and subscribe for more tutorials.

Thanks for watching, and I'll see you in the next video!`,
    settings: {
      font: 'Classic',
      speed: 2,
      fontSize: 46,
      align: 'left'
    },
    estimatedDuration: 300,
    icon: '📚'
  },
  {
    id: 'blank',
    name: 'Start from Scratch',
    description: 'Blank slate for your own content',
    category: 'blank',
    content: '',
    settings: {
      font: 'Classic',
      speed: 2,
      fontSize: 48,
      align: 'center'
    },
    estimatedDuration: 0,
    icon: '✨'
  }
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ScriptTemplate | undefined {
  return templates.find(t => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: ScriptTemplate['category']): ScriptTemplate[] {
  if (category === 'blank') {
    return templates.filter(t => t.id === 'blank');
  }
  return templates.filter(t => t.category === category);
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds === 0) return 'Custom';
  if (seconds < 60) return `${seconds} sec`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) return `${minutes} min`;
  return `${minutes} min ${remainingSeconds} sec`;
}
