import { Feed, User } from '@prisma/client';
import { db } from '../utils/db.server';

export type {
	User
}

function getUserByEmail(email: string) {
	return db.user.findFirst({
		where: {
			email
		}
	});
}

async function createUser(email: string) {
	return db.user.create({
		data: {
			email
		}
	})
}

export {
	createUser,
	getUserByEmail,
}
