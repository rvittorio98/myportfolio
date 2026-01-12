/* ============================================
   PORTFOLIO DATA
   Edit this file to add/modify projects and tools
   ============================================ */

// ========== SOFTWARE TOOLS (External links) ==========
// These are the professional tools you USE (Blender, Cinema4D, etc.)
const SOFTWARE = {
    blender: {
        name: "BLENDER",
        url: "https://www.blender.org"
    },
    cinema4d: {
        name: "CINEMA 4D",
        url: "https://www.maxon.net/cinema-4d"
    },
    aftereffect: {
        name: "AFTER EFFECT",
        url: "https://www.adobe.com/products/aftereffects.html"
    },
    touchdesigner: {
        name: "TOUCH DESIGNER",
        url: "https://derivative.ca"
    },
    houdini: {
        name: "HOUDINI",
        url: "https://www.sidefx.com"
    },
    octane: {
        name: "OCTANE",
        url: "https://home.otoy.com/render/octane-render"
    },
    unreal: {
        name: "UNREAL ENGINE",
        url: "https://www.unrealengine.com"
    },
    premiere: {
        name: "PREMIERE PRO",
        url: "https://www.adobe.com/products/premiere.html"
    },
    davinci: {
        name: "DAVINCI RESOLVE",
        url: "https://www.blackmagicdesign.com/products/davinciresolve"
    },
    figma: {
        name: "FIGMA",
        url: "https://www.figma.com"
    },
    "meshy ai": {
        name: "MESHY AI",
        url: "https://www.meshy.ai"
    }
};

// ========== YOUR TOOLS (Tools YOU created) ==========
// These are web tools/apps YOU have built - shown in the TOOL section
// Each links to the external tool URL
// 
// TO ADD IMAGES: Replace empty strings with actual paths like "images/tool-1.jpg"
const USER_TOOLS = [
    {
        id: "maiella-tool",
        title: "MAIELLA TOOL",
        description: "Interactive tool for Maiella brand — create custom PNG exports of your mountain with real-time 3D controls",
        thumbnail: "",
        video: "https://vimeo.com/1153288940",
        url: "https://maiella-tool.vercel.app/"
    },
    {
        id: "multiverse-studio",
        title: "MULTIVERSE STUDIO",
        description: "Generative visual tool built for Multiverse — experiment with dynamic layouts and export custom compositions",
        thumbnail: "",
        video: "https://vimeo.com/1153288993",
        url: "https://multiverse-studio-tool-01.vercel.app/"
    },
    {
        id: "physic-cloth-simulation",
        title: "PHYSIC CLOTH SIMULATION",
        description: "Real-time physics engine for cloth simulation — drag, cut, and export fabric interactions with custom images",
        thumbnail: "",
        video: "https://vimeo.com/1153289028",
        url: "https://physic-cloth-simulation.vercel.app/"
    }
];

// ========== PROJECTS CONFIGURATION ==========
// Your portfolio projects - each has a dedicated page
// height options: "tall", "medium", "short", "square"
//
// MEDIA FIELDS:
// - thumbnail: Image shown on homepage card
// - video: Video shown on homepage hover
// - heroVideo: Video shown at top of project page (16:9) - if empty, uses 'video' as fallback
// - heroPoster: Image shown while heroVideo loads (first frame) - if empty, uses 'thumbnail'
// - gallery: Array of media items with position: "left", "right", or "full"
//
// GALLERY FORMAT:
// { src: "path/to/file", position: "left" }   - Left column
// { src: "path/to/file", position: "right" }  - Right column  
// { src: "path/to/file", position: "full" }   - Full width (spans both columns)
//
const PROJECTS = [
    {
        id: "os-sunglasses",
        title: "OS SUNGLASSES - 3D Animation",
        slug: "os-sunglasses",
        tools: ["blender", "aftereffect"],
        thumbnail: "images/os_pie/os_pieg_01.png",
        video: "videos/os_pie/os_pieg_01.mp4",
        heroVideo: "videos/os_pie/os_pieg_ori_01.mp4",
        gallery: [
            { src: "videos/os_pie/os_pieg_02.mp4", position: "left" },
            { src: "images/os_pie/os_pie_2.png", position: "right" },
            { src: "images/os_pie/os_pie_3.png", position: "left" },
            { src: "images/os_pie/os_pie_5.png", position: "right" },
            { src: "images/os_pie/os_pie_4.png", position: "full" },
            // { src: "images/os_pie/full_width.jpg", position: "full" }  // Full width example
        ],
        description: "A 3D animation exploration for OS Sunglasses, blending abstract forms with product visualization. Fluid motion and photorealistic renders crafted in Blender and After Effects.",
        year: "2024",
        height: "tall"
    },
    {
        id: "maiella",
        title: "MAIELLA",
        slug: "maiella",
        tools: ["blender", "cinema 4d", "aftereffect", "touchdesigner", "unreal"],
        thumbnail: "images/maiella/maiella_01.png",
        video: "videos/maiella/maiella_01.mp4",
        heroVideo: "https://vimeo.com/1152996721",
        gallery: [
            { src: "https://vimeo.com/1101503896", position: "full" },
            { src: "https://vimeo.com/1101508352", position: "full" },
            { src: "https://vimeo.com/1101503961", position: "left" },
            { src: "https://vimeo.com/1101503946", position: "right" },
            { src: "https://vimeo.com/1101503915", position: "full" },
            { src: "https://vimeo.com/1101503878", position: "full" }
        ],
        description: "A visual identity project created at Multiverse for Maiella, a software company building modern business dashboards. The brand draws deep inspiration from the mountain it's named after—embodying the spirit of climbing, exploring, and reaching new heights. Through multi-disciplinary visuals combining 3D environments, realtime graphics, and generative design across Blender, Cinema 4D, TouchDesigner, and Unreal Engine, the project merges nature with digital innovation.",
        year: "2024",
        height: "short"
    },

    {
        id: "os-hellokitty",
        title: "OS HELLOKITTY",
        slug: "os-hellokitty",
        tools: ["blender", "aftereffect", "meshy ai"],
        thumbnail: "images/hellokitty/hellokitty_01.png",
        video: "videos/hellokitty/hellokitty_01.mp4",
        heroVideo: "",
        gallery: [
            { src: "https://vimeo.com/1103045806", position: "left" },
            { src: "https://vimeo.com/1103045836", position: "right" },
            { src: "https://vimeo.com/1103045890", position: "left" },
            { src: "https://vimeo.com/1103045860", position: "right" },
            { src: "https://vimeo.com/1103045765", position: "full" },
            { src: "https://vimeo.com/1103045696", position: "full" }
        ],
        description: "A motion design series featuring the iconic Hello Kitty charms. For this project, I developed a hybrid workflow by generating initial 3D models from photos of the physical charms using Meshy AI. These assets were then refined and brought to life with playful animations in Blender, followed by vibrant compositing and finishing in After Effects.",
        year: "2023",
        height: "tall"
    },
    {
        id: "AI GENERATION",
        title: "AI GENERATION",
        slug: "ai-generation",
        tools: ["nano banana", "veo3", "aftereffect"],
        thumbnail: "images/ai_image/ai_01.png",
        video: "videos/ai_video/ai_01.mp4",
        heroVideo: "videos/ai_generation/ai_01.mp4",
        gallery: [
            { src: "videos/ai_video/ai_01.mp4", position: "left" },
            { src: "videos/ai_video/ai_2.mp4", position: "right" },
            { src: "videos/ai_video/ai_3.mp4", position: "left" },
            { src: "videos/ai_video/ai_4.mp4", position: "right" },
            { src: "videos/ai_video/ai_5.mp4", position: "left" },
            { src: "videos/ai_video/ai_6.mp4", position: "right" },
        ],
        description: "An experimental series exploring AI-driven video generation. Using cutting-edge tools like Kling, Nano Banana, and Veo3, combined with traditional post-production in After Effects to push creative boundaries.",
        year: "2023",
        height: "medium"
    },
    {
        id: "expertiment-and-more",
        title: "EXPERTIMENT AND MORE",
        slug: "expertiment-and-more",
        tools: ["blender", "aftereffect"],
        thumbnail: "images/expe/ss_01.png",
        video: "videos/expe/ss_01.mp4",
        heroVideo: "",
        gallery: [
            { src: "https://vimeo.com/1103176436", position: "full" },
            { src: "https://vimeo.com/1103382908", position: "full" },
            { src: "https://vimeo.com/1103176532", position: "full" },
            { src: "https://vimeo.com/1103383907", position: "full" },
            { src: "https://vimeo.com/1103176466", position: "full" },
        ],
        description: "A visual playground showcasing experimental 3D animations and motion studies. Personal explorations in form, light, and movement crafted in Blender and After Effects.",
        year: "2023",
        height: "short"
    }
];

// ========== SOCIAL LINKS ==========
const SOCIAL_LINKS = {
    email: "rvittorio98@gmail.com",
    instagram: "https://www.instagram.com/russovittorio98/",
    linkedin: "https://linkedin.com/in/vittorio-russo-0b2b991b7",
    github: "https://github.com/rvittorio98"
};

// ========== ABOUT INFO ==========
const ABOUT_INFO = {
    name: "RUSSO VITTORIO",
    title: "CREATIVE TECHNOLOGIST & MOTION DESIGNER",
    bio: `I'm a Creative Technologist with a foundation in pure motion design and high-end 3D. My expertise is rooted in the mastery of movement, storytelling, and visual aesthetics—complemented by a specialization in agentic architectures and AI-driven workflows.

I don't just use AI as a shortcut; I architect intelligent systems to enhance procedural 3D environments and create next-generation interactive experiences.

My approach is defined by what I call "Systematic Creativity": when faced with a time-consuming or repetitive task in After Effects or Blender, my first instinct is to engineer a solution rather than execute it manually. I leverage AI agents to develop custom scripts or dedicated plugins in minutes, turning hours of labor into seconds of execution. This ensures that my creative bandwidth remains focused on high-level art direction and storytelling, rather than technical repetition.`,
    skills: [
        "3D & Motion Design — Cinema 4D, Blender, Unreal Engine",
        "High-end 3D Modeling, Procedural Animation, Cinematic Storytelling",
        "Adobe Suite — After Effects, Premiere Pro, Illustrator, Photoshop",
        "AI Engineering — Agentic IDEs, Claude/Gemini APIs, RAG Systems",
        "Web & Interactive Prototyping — React/Next.js, 3D Web Interfaces"
    ],
    experience: [
        {
            role: "Creative Technologist & Motion Designer",
            company: "Multiverse",
            period: "2024 — Present"
        },
        {
            role: "AI Systems Developer & Freelance Motion Designer",
            company: "Independent",
            period: "2022 — Present"
        }
    ]
};