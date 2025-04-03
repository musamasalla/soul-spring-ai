import { MeditationProgramData, ProgramMeditationData } from "@/types/meditation";
import { supabase } from "@/integrations/supabase/client";

// Sample multi-day programs for different mental health goals
export const SAMPLE_PROGRAMS: MeditationProgramData[] = [
  {
    id: "anxiety-reduction-program",
    title: "7-Day Anxiety Reduction Program",
    description: "A structured program designed to help reduce anxiety through progressive meditation techniques. Each day builds on the previous, introducing new skills to manage anxiety effectively.",
    coverImage: "/images/programs/anxiety-reduction.jpg",
    totalDays: 7,
    category: ["Anxiety", "Stress Relief", "Mental Health"],
    tags: ["anxiety", "worry", "stress", "beginner-friendly"],
    level: "beginner",
    targetGoal: "Reduce anxiety and develop coping skills for anxious thoughts",
    expectedOutcomes: [
      "Reduced overall anxiety",
      "Better awareness of anxiety triggers",
      "Practical skills to manage anxious thoughts",
      "Improved relaxation response"
    ],
    authorName: "Dr. Michael Kim",
    authorCredentials: "Clinical Psychologist, Mindfulness Practitioner",
    meditations: [
      {
        id: "anxiety-day1",
        title: "Day 1: Understanding Anxiety",
        description: "An introduction to anxiety and how meditation can help. Learn the basics of mindful breathing to calm your nervous system.",
        audioSrc: "/meditations/programs/anxiety/day1.mp3",
        duration: 600, // 10 minutes
        instructor: "Dr. Michael Kim",
        category: ["Anxiety", "Breathing"],
        day: 1,
        order: 1
      },
      {
        id: "anxiety-day2",
        title: "Day 2: Body Scan for Tension Release",
        description: "Identify and release physical tension related to anxiety through a guided body scan meditation.",
        audioSrc: "/meditations/programs/anxiety/day2.mp3",
        duration: 720, // 12 minutes
        instructor: "Dr. Michael Kim",
        category: ["Anxiety", "Body Awareness"],
        day: 2,
        order: 1
      },
      {
        id: "anxiety-day3",
        title: "Day 3: Thought Observation",
        description: "Learn to observe anxious thoughts without getting caught up in them. Practice creating distance from worrying thoughts.",
        audioSrc: "/meditations/programs/anxiety/day3.mp3",
        duration: 900, // 15 minutes
        instructor: "Dr. Michael Kim",
        category: ["Anxiety", "Cognitive"],
        day: 3,
        order: 1
      },
      {
        id: "anxiety-day4",
        title: "Day 4: Calming the Racing Mind",
        description: "Techniques to slow down racing thoughts and restore a sense of control and calm.",
        audioSrc: "/meditations/programs/anxiety/day4.mp3",
        duration: 900, // 15 minutes
        instructor: "Dr. Michael Kim",
        category: ["Anxiety", "Calming"],
        day: 4,
        order: 1
      },
      {
        id: "anxiety-day5",
        title: "Day 5: Self-Compassion for Anxiety",
        description: "Learn how self-compassion can reduce anxiety and harsh self-judgment that often accompanies worry.",
        audioSrc: "/meditations/programs/anxiety/day5.mp3",
        duration: 900, // 15 minutes
        instructor: "Dr. Michael Kim",
        category: ["Anxiety", "Self-Compassion"],
        day: 5,
        order: 1
      },
      {
        id: "anxiety-day6",
        title: "Day 6: Grounding Techniques",
        description: "Powerful grounding practices to use during moments of high anxiety or panic.",
        audioSrc: "/meditations/programs/anxiety/day6.mp3",
        duration: 600, // 10 minutes
        instructor: "Dr. Michael Kim",
        category: ["Anxiety", "Grounding"],
        day: 6,
        order: 1
      },
      {
        id: "anxiety-day7",
        title: "Day 7: Creating Your Anxiety Toolkit",
        description: "Consolidate what you've learned into a personalized toolkit for managing anxiety in daily life.",
        audioSrc: "/meditations/programs/anxiety/day7.mp3",
        duration: 1200, // 20 minutes
        instructor: "Dr. Michael Kim",
        category: ["Anxiety", "Integration"],
        day: 7,
        order: 1
      }
    ]
  },
  {
    id: "sleep-improvement-program",
    title: "5-Day Better Sleep Program",
    description: "Transform your sleep quality with this 5-day program designed to address common sleep issues and establish healthy sleep patterns through meditation.",
    coverImage: "/images/programs/sleep-improvement.jpg",
    totalDays: 5,
    category: ["Sleep", "Relaxation", "Wellness"],
    tags: ["insomnia", "sleep quality", "relaxation", "bedtime routine"],
    level: "beginner",
    targetGoal: "Improve sleep quality and establish healthy sleep patterns",
    expectedOutcomes: [
      "Reduced time to fall asleep",
      "Fewer nighttime awakenings",
      "More refreshing sleep",
      "Sustainable bedtime relaxation habits"
    ],
    authorName: "Emma Wilson",
    authorCredentials: "Sleep Specialist, Meditation Teacher",
    meditations: [
      {
        id: "sleep-day1",
        title: "Day 1: Sleep Foundations",
        description: "Learn about the connection between mind, body, and sleep quality, with an introduction to sleep-supporting meditation.",
        audioSrc: "/meditations/programs/sleep/day1.mp3",
        duration: 900, // 15 minutes
        instructor: "Emma Wilson",
        category: ["Sleep", "Education"],
        day: 1,
        order: 1
      },
      {
        id: "sleep-day2",
        title: "Day 2: Full Body Relaxation",
        description: "A progressive muscle relaxation practice designed to release physical tension that prevents sleep.",
        audioSrc: "/meditations/programs/sleep/day2.mp3",
        duration: 1200, // 20 minutes
        instructor: "Emma Wilson",
        category: ["Sleep", "Relaxation"],
        day: 2,
        order: 1
      },
      {
        id: "sleep-day3",
        title: "Day 3: Quieting the Mental Chatter",
        description: "Techniques to calm the busy mind and racing thoughts that often disrupt sleep.",
        audioSrc: "/meditations/programs/sleep/day3.mp3",
        duration: 900, // 15 minutes
        instructor: "Emma Wilson",
        category: ["Sleep", "Mind"],
        day: 3,
        order: 1
      },
      {
        id: "sleep-day4",
        title: "Day 4: Bedtime Visualization",
        description: "Soothing visualizations that prepare your mind and body for deep, restorative sleep.",
        audioSrc: "/meditations/programs/sleep/day4.mp3",
        duration: 1500, // 25 minutes
        instructor: "Emma Wilson",
        category: ["Sleep", "Visualization"],
        day: 4,
        order: 1
      },
      {
        id: "sleep-day5",
        title: "Day 5: Your Personalized Sleep Ritual",
        description: "Integrate what you've learned into a sustainable bedtime ritual that signals to your body it's time for sleep.",
        audioSrc: "/meditations/programs/sleep/day5.mp3",
        duration: 1200, // 20 minutes
        instructor: "Emma Wilson",
        category: ["Sleep", "Integration"],
        day: 5,
        order: 1
      }
    ]
  },
  {
    id: "stress-resilience-program",
    title: "10-Day Stress Resilience Program",
    description: "Build lasting resilience to stress with this comprehensive program. Learn progressive techniques to not just manage stress but develop a more robust response to life's challenges.",
    coverImage: "/images/programs/stress-resilience.jpg",
    totalDays: 10,
    category: ["Stress Management", "Resilience", "Mindfulness"],
    tags: ["stress", "burnout", "workplace", "resilience", "advanced"],
    level: "intermediate",
    isPremium: true,
    targetGoal: "Develop stress resilience and effective coping mechanisms",
    expectedOutcomes: [
      "Reduced reactivity to stressors",
      "Improved recovery from stress",
      "Better emotional regulation during stress",
      "Enhanced work-life balance",
      "Sustainable stress management practices"
    ],
    authorName: "Sarah Chen",
    authorCredentials: "Mindfulness Coach, Stress Management Specialist",
    meditations: [
      {
        id: "stress-day1",
        title: "Day 1: Understanding Your Stress Response",
        description: "Learn about your body's stress response and how mindfulness can interrupt the stress cycle.",
        audioSrc: "/meditations/programs/stress/day1.mp3",
        duration: 900, // 15 minutes
        instructor: "Sarah Chen",
        category: ["Stress", "Education"],
        day: 1,
        order: 1
      },
      {
        id: "stress-day2",
        title: "Day 2: Breath as an Anchor",
        description: "Discover how the breath can serve as an immediate tool to regulate your nervous system during stress.",
        audioSrc: "/meditations/programs/stress/day2.mp3",
        duration: 900, // 15 minutes
        instructor: "Sarah Chen",
        category: ["Stress", "Breathing"],
        day: 2,
        order: 1
      },
      // Days 3-9 would be defined here with appropriate progression
      {
        id: "stress-day10",
        title: "Day 10: Your Personalized Resilience Plan",
        description: "Integrate all techniques into a comprehensive resilience plan tailored to your specific stressors and lifestyle.",
        audioSrc: "/meditations/programs/stress/day10.mp3",
        duration: 1500, // 25 minutes
        instructor: "Sarah Chen",
        category: ["Stress", "Integration"],
        day: 10,
        order: 1
      }
    ]
  },
  {
    id: "self-compassion-program",
    title: "7-Day Self-Compassion Journey",
    description: "Cultivate a kinder relationship with yourself through this structured self-compassion program. Learn to treat yourself with the same kindness you would offer a good friend.",
    coverImage: "/images/programs/self-compassion.jpg",
    totalDays: 7,
    category: ["Self-Compassion", "Emotional Wellbeing"],
    tags: ["self-criticism", "compassion", "self-esteem", "kindness"],
    level: "beginner",
    targetGoal: "Develop a compassionate relationship with yourself and reduce self-criticism",
    expectedOutcomes: [
      "Reduced self-criticism",
      "Increased self-kindness",
      "Better emotional resilience",
      "Healthier response to failure and setbacks"
    ],
    authorName: "David Park",
    authorCredentials: "Compassion-Focused Therapist",
    meditations: [
      {
        id: "compassion-day1",
        title: "Day 1: The Foundations of Self-Compassion",
        description: "Learn what self-compassion is and isn't, and why it's crucial for mental wellbeing.",
        audioSrc: "/meditations/programs/compassion/day1.mp3",
        duration: 900, // 15 minutes
        instructor: "David Park",
        category: ["Self-Compassion", "Education"],
        day: 1,
        order: 1
      },
      // Additional days would be defined here
    ]
  },
  {
    id: "mindfulness-foundations-program",
    title: "14-Day Mindfulness Foundations",
    description: "A comprehensive introduction to mindfulness meditation for beginners. Build a solid foundation for your meditation practice with this structured two-week program.",
    coverImage: "/images/programs/mindfulness-foundations.jpg",
    totalDays: 14,
    category: ["Mindfulness", "Meditation", "Beginners"],
    tags: ["beginner", "mindfulness", "meditation", "concentration"],
    level: "beginner",
    targetGoal: "Establish a regular mindfulness practice and learn core mindfulness skills",
    expectedOutcomes: [
      "Understanding of key mindfulness concepts",
      "Daily meditation habit",
      "Improved attention and concentration",
      "Reduced reactivity",
      "Greater present-moment awareness"
    ],
    authorName: "Sarah Chen",
    authorCredentials: "Certified Mindfulness Teacher",
    meditations: [
      {
        id: "mindfulness-day1",
        title: "Day 1: Introduction to Mindfulness",
        description: "Learn what mindfulness is and how it can benefit your life. Begin with a simple breath awareness practice.",
        audioSrc: "/meditations/programs/mindfulness/day1.mp3",
        duration: 600, // 10 minutes
        instructor: "Sarah Chen",
        category: ["Mindfulness", "Beginners"],
        day: 1,
        order: 1
      },
      // Additional days would be defined here
    ]
  }
];

/**
 * Fetches all available meditation programs
 */
export const getAllPrograms = async (): Promise<MeditationProgramData[]> => {
  try {
    // Check if we're using Supabase in development or sample data
    if (process.env.NODE_ENV === 'development') {
      // For development, return the sample programs
      return SAMPLE_PROGRAMS;
    }
    
    // For production, fetch from Supabase
    const { data, error } = await supabase
      .from('meditation_programs')
      .select('*');
    
    if (error) {
      console.error('Error fetching programs:', error);
      throw error;
    }
    
    // Transform data if needed and return
    return data as MeditationProgramData[];
  } catch (error) {
    console.error('Error in getAllPrograms:', error);
    // Fallback to sample data if fetching fails
    return SAMPLE_PROGRAMS;
  }
};

/**
 * Gets a specific program by ID
 */
export const getProgramById = async (programId: string): Promise<MeditationProgramData | null> => {
  try {
    // For development or fallback, search in sample programs
    if (process.env.NODE_ENV === 'development') {
      const program = SAMPLE_PROGRAMS.find(p => p.id === programId);
      return program || null;
    }
    
    // For production, fetch from Supabase
    const { data, error } = await supabase
      .from('meditation_programs')
      .select('*, program_meditations(*)')
      .eq('id', programId)
      .single();
    
    if (error) {
      console.error(`Error fetching program ${programId}:`, error);
      throw error;
    }
    
    return data as MeditationProgramData;
  } catch (error) {
    console.error(`Error in getProgramById (${programId}):`, error);
    // Fallback to sample data
    const program = SAMPLE_PROGRAMS.find(p => p.id === programId);
    return program || null;
  }
};

/**
 * Gets all programs related to a specific mental health goal or category
 */
export const getProgramsByCategory = async (category: string): Promise<MeditationProgramData[]> => {
  try {
    // For development, filter sample programs
    if (process.env.NODE_ENV === 'development') {
      return SAMPLE_PROGRAMS.filter(program => 
        program.category.some(cat => cat.toLowerCase() === category.toLowerCase())
      );
    }
    
    // For production, fetch from Supabase
    const { data, error } = await supabase
      .from('meditation_programs')
      .select('*')
      .contains('category', [category]);
    
    if (error) {
      console.error(`Error fetching programs for category ${category}:`, error);
      throw error;
    }
    
    return data as MeditationProgramData[];
  } catch (error) {
    console.error(`Error in getProgramsByCategory (${category}):`, error);
    // Fallback to filtering sample data
    return SAMPLE_PROGRAMS.filter(program => 
      program.category.some(cat => cat.toLowerCase() === category.toLowerCase())
    );
  }
};

/**
 * Enrolls a user in a meditation program
 */
export const enrollInProgram = async (userId: string, programId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_program_enrollments')
      .insert({
        user_id: userId,
        program_id: programId,
        current_day: 1,
        last_completed_day: 0,
        start_date: new Date().toISOString(),
        completion_rate: 0
      });
    
    if (error) {
      console.error(`Error enrolling user ${userId} in program ${programId}:`, error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Error in enrollInProgram (user: ${userId}, program: ${programId}):`, error);
    return false;
  }
};

/**
 * Updates a user's progress in a meditation program
 */
export const updateProgramProgress = async (
  userId: string, 
  programId: string, 
  completedDay: number
): Promise<boolean> => {
  try {
    // Get the program to calculate completion rate
    const program = await getProgramById(programId);
    if (!program) {
      throw new Error(`Program ${programId} not found`);
    }
    
    // Calculate new completion rate
    const completionRate = (completedDay / program.totalDays) * 100;
    
    // Update the user's progress
    const { error } = await supabase
      .from('user_program_enrollments')
      .update({
        last_completed_day: completedDay,
        current_day: Math.min(completedDay + 1, program.totalDays),
        completion_rate: completionRate,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('program_id', programId);
    
    if (error) {
      console.error(`Error updating progress for user ${userId} in program ${programId}:`, error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Error in updateProgramProgress:`, error);
    return false;
  }
};

/**
 * Gets all programs a user is currently enrolled in
 */
export const getUserEnrolledPrograms = async (userId: string): Promise<MeditationProgramData[]> => {
  try {
    // Get enrollments
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('user_program_enrollments')
      .select('program_id, current_day, last_completed_day, start_date, completion_rate')
      .eq('user_id', userId);
    
    if (enrollmentError) {
      console.error(`Error fetching enrollments for user ${userId}:`, enrollmentError);
      throw enrollmentError;
    }
    
    // If no enrollments, return empty array
    if (!enrollments || enrollments.length === 0) {
      return [];
    }
    
    // For each enrollment, get the full program data
    const programPromises = enrollments.map(async (enrollment) => {
      const program = await getProgramById(enrollment.program_id);
      if (!program) return null;
      
      // Add user progress to the program data
      return {
        ...program,
        userProgress: {
          currentDay: enrollment.current_day,
          lastCompletedDay: enrollment.last_completed_day,
          startDate: enrollment.start_date,
          completionRate: enrollment.completion_rate
        }
      };
    });
    
    // Resolve all promises and filter out any nulls
    const programs = (await Promise.all(programPromises)).filter(p => p !== null) as MeditationProgramData[];
    return programs;
  } catch (error) {
    console.error(`Error in getUserEnrolledPrograms (user: ${userId}):`, error);
    return [];
  }
};

/**
 * Gets recommended programs based on user's mood data and activity
 */
export const getRecommendedPrograms = async (userId: string): Promise<MeditationProgramData[]> => {
  try {
    // Get user's recent mood entries
    const { data: moodEntries, error: moodError } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (moodError) {
      console.error(`Error fetching mood entries for user ${userId}:`, moodError);
      throw moodError;
    }
    
    // Simple recommendation logic based on most frequent mood
    if (!moodEntries || moodEntries.length === 0) {
      // No mood data, return generic recommendations
      return SAMPLE_PROGRAMS.slice(0, 3);
    }
    
    // Count mood frequencies
    const moodCounts: Record<string, number> = {};
    moodEntries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    // Find most common mood
    let mostCommonMood = '';
    let highestCount = 0;
    
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > highestCount) {
        mostCommonMood = mood;
        highestCount = count;
      }
    });
    
    // Map moods to recommended program categories
    const moodToProgramMap: Record<string, string[]> = {
      'anxious': ['Anxiety', 'Stress Management', 'Mindfulness'],
      'sad': ['Self-Compassion', 'Depression', 'Emotional Wellbeing'],
      'neutral': ['Mindfulness', 'Self-Discovery'],
      'happy': ['Gratitude', 'Positivity', 'Emotional Wellbeing'],
      'sleepy': ['Sleep', 'Energy', 'Focus'],
      'stressed': ['Stress Management', 'Relaxation', 'Resilience'],
      'calm': ['Mindfulness', 'Meditation', 'Awareness']
    };
    
    // Get recommended categories based on mood
    const recommendedCategories = moodToProgramMap[mostCommonMood] || ['Mindfulness', 'Stress Management'];
    
    // Filter programs that match these categories
    const recommendedPrograms = SAMPLE_PROGRAMS.filter(program => 
      program.category.some(cat => recommendedCategories.includes(cat))
    );
    
    // Return top 3 or all if less than 3
    return recommendedPrograms.slice(0, 3);
  } catch (error) {
    console.error(`Error in getRecommendedPrograms (user: ${userId}):`, error);
    return SAMPLE_PROGRAMS.slice(0, 3);
  }
}; 