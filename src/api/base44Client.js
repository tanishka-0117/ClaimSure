// localStorage-backed mock implementation of Base44 SDK
// Data persists across page refreshes and syncs between tabs via BroadcastChannel

const STORAGE_PREFIX = 'claimsure.entity.';
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('claimsure-entity-sync') : null;

class MockEntity {
  constructor(name) {
    this.name = name;
    this.storageKey = STORAGE_PREFIX + name;
    this.subscribers = new Set();

    // Listen for cross-tab updates
    if (channel) {
      channel.addEventListener('message', (event) => {
        if (event.data?.entity === this.name) {
          this.notifySubscribers(event.data.event);
        }
      });
    }
  }

  _read() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  _write(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  async list(orderBy = null, limit = null) {
    let result = [...this._read()];
    if (orderBy?.startsWith('-')) {
      const field = orderBy.substring(1);
      result.sort((a, b) => new Date(b[field]) - new Date(a[field]));
    }
    if (limit) {
      result = result.slice(0, limit);
    }
    return result;
  }

  async filter(conditions, orderBy = null, limit = null) {
    let result = this._read().filter(item => {
      for (const key in conditions) {
        if (item[key] !== conditions[key]) return false;
      }
      return true;
    });

    if (orderBy?.startsWith('-')) {
      const field = orderBy.substring(1);
      result.sort((a, b) => new Date(b[field]) - new Date(a[field]));
    } else if (orderBy) {
      result.sort((a, b) => new Date(a[orderBy]) - new Date(b[orderBy]));
    }

    if (limit) {
      result = result.slice(0, limit);
    }
    return result;
  }

  async create(item) {
    const data = this._read();
    const newItem = { id: String(Date.now() + Math.random()), ...item, created_date: new Date().toISOString() };
    data.push(newItem);
    this._write(data);
    const evt = { type: 'create', data: newItem };
    this.notifySubscribers(evt);
    this._broadcast(evt);
    return newItem;
  }

  async bulkCreate(items) {
    const data = this._read();
    const created = [];
    for (const item of items) {
      const newItem = { id: String(Date.now() + Math.random()), ...item, created_date: new Date().toISOString() };
      data.push(newItem);
      created.push(newItem);
    }
    this._write(data);
    // Notify for the last one to trigger a re-render
    if (created.length > 0) {
      const evt = { type: 'create', data: created[created.length - 1] };
      this.notifySubscribers(evt);
      this._broadcast(evt);
    }
  }

  async update(id, updates) {
    const data = this._read();
    const idx = data.findIndex(item => String(item.id) === String(id));
    if (idx !== -1) {
      data[idx] = { ...data[idx], ...updates };
      this._write(data);
      const evt = { type: 'update', id, data: data[idx] };
      this.notifySubscribers(evt);
      this._broadcast(evt);
      return data[idx];
    }
    return null;
  }

  async delete(id) {
    const data = this._read();
    const filtered = data.filter(item => String(item.id) !== String(id));
    this._write(filtered);
    const evt = { type: 'delete', id };
    this.notifySubscribers(evt);
    this._broadcast(evt);
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(event) {
    for (const sub of this.subscribers) {
      sub(event);
    }
  }

  _broadcast(event) {
    if (channel) {
      channel.postMessage({ entity: this.name, event });
    }
  }
}

export const base44 = {
  entities: {
    Worker: new MockEntity('Worker'),
    Claim: new MockEntity('Claim')
  },
  auth: {
    me: async () => ({ id: 'mock-user-1', name: 'Demo User', email: 'demo@claimsure.com' }),
    logout: () => { window.location.href = '/'; },
    redirectToLogin: () => { window.location.href = '/'; }
  }
};
