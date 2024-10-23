import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

// Message Operations
export const messageOps = {
  async saveMessage(message) {
    const messageId = await redis.incr('message:counter');
    const messageData = {
      id: messageId,
      userName: message.userName,
      text: message.text,
      time: new Date().toISOString(),
      isPrivate: message.isPrivate || false,
      senderTag: message.senderTag,
      to: message.to,
      from: message.from
    };

    if (message.isPrivate) {
      // Store private message in both directions to ensure proper retrieval
      const messageStr = JSON.stringify(messageData);
      
      // Store for sender
      await redis.lpush(
        `private:messages:${message.from}:${message.to}`,
        messageStr
      );
      await redis.ltrim(`private:messages:${message.from}:${message.to}`, 0, 99);
      
      // Store for recipient (same message, different key)
      await redis.lpush(
        `private:messages:${message.to}:${message.from}`,
        messageStr
      );
      await redis.ltrim(`private:messages:${message.to}:${message.from}`, 0, 99);
    } else {
      // Store public message
      await redis.lpush('chat:messages', JSON.stringify(messageData));
      await redis.ltrim('chat:messages', 0, 99);
    }

    return messageData;
  },

  async getRecentMessages(limit = 50) {
    const messages = await redis.lrange('chat:messages', 0, limit - 1);
    return messages.map(msg => JSON.parse(msg));
  },

  async getPrivateMessages(from, to, limit = 50) {
    // Get messages from both directions
    const [sentMessages, receivedMessages] = await Promise.all([
      redis.lrange(`private:messages:${from}:${to}`, 0, limit - 1),
      redis.lrange(`private:messages:${to}:${from}`, 0, limit - 1)
    ]);

    // Combine and parse messages
    const allMessages = [...sentMessages, ...receivedMessages]
      .map(msg => JSON.parse(msg))
      // Sort by time
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      // Limit total messages
      .slice(0, limit);

    return allMessages;
  }
};

// User Operations
export const userOps = {
  async saveUser(user) {
    await redis.hmset(`user:${user.id}`, {
      userName: user.userName,
      tag: user.tag,
      status: 'online',
      lastSeen: new Date().toISOString()
    });
    
    // Store a reference to user by tag for easy lookup
    await redis.set(`tag:${user.tag}`, user.id);
    
    if (user.contacts?.length) {
      await redis.sadd(`user:${user.id}:contacts`, ...user.contacts);
    }
    
    await redis.sadd('online_users', user.id);
  },

  async getUser(userId) {
    const user = await redis.hgetall(`user:${userId}`);
    if (!user || Object.keys(user).length === 0) return null;
    
    const contacts = await redis.smembers(`user:${userId}:contacts`);
    return { ...user, contacts };
  },

  async getUserByTag(tag) {
    const userId = await redis.get(`tag:${tag}`);
    if (!userId) return null;
    return await this.getUser(userId);
  },

  async updateUserStatus(userId, status) {
    await redis.hset(`user:${userId}`, 'status', status);
    await redis.hset(`user:${userId}`, 'lastSeen', new Date().toISOString());
    
    if (status === 'online') {
      await redis.sadd('online_users', userId);
    } else {
      await redis.srem('online_users', userId);
    }
  },

  async addContact(userId, contactTag) {
    await redis.sadd(`user:${userId}:contacts`, contactTag);
  },

  async removeContact(userId, contactTag) {
    await redis.srem(`user:${userId}:contacts`, contactTag);
  },

  async getContacts(userId) {
    const contactTags = await redis.smembers(`user:${userId}:contacts`);
    const contacts = [];
    
    for (const tag of contactTags) {
      const contact = await this.getUserByTag(tag);
      if (contact) {
        const isOnline = await redis.sismember('online_users', contact.id);
        contacts.push({
          userName: contact.userName,
          tag: contact.tag,
          status: isOnline ? 'online' : 'offline'
        });
      }
    }
    
    return contacts;
  },

  async getOnlineUsers() {
    return await redis.smembers('online_users');
  }
};

// Session Management
export const sessionOps = {
  async createSession(userId, socketId) {
    await redis.hmset(`session:${userId}`, {
      socketId,
      lastActivity: new Date().toISOString()
    });
    // Session expires in 24 hours
    await redis.expire(`session:${userId}`, 24 * 60 * 60);
  },

  async removeSession(userId) {
    await redis.del(`session:${userId}`);
  },

  async getSession(userId) {
    return await redis.hgetall(`session:${userId}`);
  }
};

export default redis;
