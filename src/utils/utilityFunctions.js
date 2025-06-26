export class BrowserUser {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
};

export const getEnhancedGreeting = () => {
  const hour = new Date().getHours();
  const greetings = {
    morning: ['Good Morning', 'Rise and Shine', 'Top of the Morning'],
    afternoon: ['Good Afternoon', 'Hope your day is going well'],
    evening: ['Good Evening', 'Hope you had a great day'],
    night: ['Good Night', 'Hello night owl']
  };

  let timeOfDay = 'night';
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';

  const options = greetings[timeOfDay];
  return options[Math.floor(Math.random() * options.length)];
};

export const getCurrentUser = () => {
  try {
    const localUser = localStorage.getItem('currentUser');
    if (localUser) {
      const { name, age } = JSON.parse(localUser);
      return new BrowserUser(name, age);
    }

    const sessionUser = sessionStorage.getItem('currentUser');
    if (sessionUser) {
      const { name, age } = JSON.parse(sessionUser);
      return new BrowserUser(name, age);
    }

    return new BrowserUser('Kriti', '');
  } catch (err) {
    console.error('Error retrieving user:', err);
    return new BrowserUser('Kriti', '');
  }
};

export const setCurrentUser = (name, age) => {
  try {
    const data = { name, age };
    localStorage.setItem('currentUser', JSON.stringify(data));
    return new BrowserUser(name, age);
  } catch (err) {
    console.error('Error setting user:', err);
    return null;
  }
};

export const getCurrentDateTime = () => {
  const now = new Date();
  return now.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};