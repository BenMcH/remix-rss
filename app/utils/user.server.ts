import bcrypt from 'bcrypt'
import { User } from '@prisma/client';
import { db } from './db.server';


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

async function createUser(email: string, password: string) {
	return db.user.create({
		data: {
			email,
			passwordHash: await bcrypt.hash(password, 10)
		}
	})
}

export {
	createUser,
	getUserByEmail
}
