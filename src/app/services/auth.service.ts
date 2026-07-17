import { Injectable } from '@angular/core';

export interface RegisteredUser {
name: string;
email: string;
password: string;
}

@Injectable({
providedIn: 'root'
})
export class AuthService {
private readonly usersKey = 'argenda_users';
private readonly sessionKey = 'argenda_session';

register(user: RegisteredUser): boolean {
    const users = this.getUsers();

    const emailExists = users.some(
    existingUser =>
        existingUser.email.toLowerCase() === user.email.toLowerCase()
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
        existingUser.email.toLowerCase() === email.toLowerCase() &&
        existingUser.password === password
    );

    if (!user) {
    return false;
    }

    localStorage.setItem(
    this.sessionKey,
    JSON.stringify({
        name: user.name,
        email: user.email
    })
    );

    return true;
}

logout(): void {
    localStorage.removeItem(this.sessionKey);
}

isLoggedIn(): boolean {
    return localStorage.getItem(this.sessionKey) !== null;
}

getCurrentUser(): { name: string; email: string } | null {
    const session = localStorage.getItem(this.sessionKey);

    if (!session) {
    return null;
    }

    return JSON.parse(session);
}

private getUsers(): RegisteredUser[] {
    const users = localStorage.getItem(this.usersKey);

    if (!users) {
    return [];
    }

    return JSON.parse(users);
}
}