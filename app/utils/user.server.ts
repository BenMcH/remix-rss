import bcrypt from 'bcrypt'
import { Feed, User } from '@prisma/client';
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

async function getSubscribedFeeds(user: User) {
	return db.feedSubscription.findMany({
		where: {
			user
		},
		include: {
			feed: true
		}
	}).then(subscriptions => subscriptions.map(subscription => subscription.feed));
}

async function deleteSubscription(user: User | null, feedId: string) {
	if (!user) return;
	await db.feedSubscription.deleteMany({
		where: {
			feedId,
			userId: user.id
		}
	});
}

async function createFeedSubscription(user: User, feed: Feed) {
	await db.feedSubscription.deleteMany({
		where: {
			userId: user.id,
			feedId: feed.id
		}
	});
	return db.feedSubscription.create({
		data: {
			userId: user.id,
			feedId: feed.id
		}
	})
}

export {
	createUser,
	getUserByEmail,
	getSubscribedFeeds,
	createFeedSubscription,
	deleteSubscription
}
