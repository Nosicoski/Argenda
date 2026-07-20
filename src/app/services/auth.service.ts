import {
Injectable,
computed,
signal
} from '@angular/core';

export interface RegisteredUser {
name: string;
email: string;
password: string;
}

export interface SessionUser {
name: string;
email: string;
}

@Injectable({
providedIn: 'root'
})
export class AuthService {
private readonly usersKey = 'argenda_users';
private readonly sessionKey = 'argenda_session';

private readonly currentUserSignal =
    signal<SessionUser | null>(this.readStoredSession());

readonly currentUser = this.currentUserSignal.asReadonly();

readonly loggedIn = computed(
    () => this.currentUserSignal() !== null
);

register(user: RegisteredUser): boolean {
    const users = this.getUsers();

    const emailExists = users.some(
    existingUser =>
        existingUser.email.toLowerCase() ===
        user.email.toLowerCase()
    );

    if (emailExists) {
    return false;
    }

    users.push(user);

    localStorage.setItem(
    this.usersKey,
    JSON.stringify(users)
    );

    return true;
}

login(email: string, password: string): boolean {
    const users = this.getUsers();

    const user = users.find(
    existingUser =>
        existingUser.email.toLowerCase() ===
        email.toLowerCase() &&
        existingUser.password === password
    );

    if (!user) {
    return false;
    }

    const sessionUser: SessionUser = {
    name: user.name,
    email: user.email
    };

    localStorage.setItem(
    this.sessionKey,
    JSON.stringify(sessionUser)
    );

    this.currentUserSignal.set(sessionUser);

    return true;
}

logout(): void {
    localStorage.removeItem(this.sessionKey);
    this.currentUserSignal.set(null);
}

isLoggedIn(): boolean {
    return this.loggedIn();
}

getCurrentUser(): SessionUser | null {
    return this.currentUser();
}

private readStoredSession(): SessionUser | null {
    const session = localStorage.getItem(this.sessionKey);

    if (!session) {
    return null;
    }

    try {
    return JSON.parse(session) as SessionUser;
    } catch {
    localStorage.removeItem(this.sessionKey);
    return null;
    }
}

private getUsers(): RegisteredUser[] {
    const users = localStorage.getItem(this.usersKey);

    if (!users) {
    return [];
    }

    try {
    return JSON.parse(users) as RegisteredUser[];
    } catch {
    localStorage.removeItem(this.usersKey);
    return [];
    }
}
}