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

async function getSubscribedFeeds(user: User) {
	return db.feedSubscription.findMany({
		where: {
			user
		},
		include: {
			feed: true
		},
		orderBy: {
			feed: {
				title: 'asc'
			}
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

async function createFeedSubscription(user: Pick<User, 'id'>, feed: Pick<Feed, 'id'>) {
	let where = {userId: user.id, feedId: feed.id}
	let dbFeedSubscription = await db.feedSubscription.findFirst({where});

	if (dbFeedSubscription) {
		return dbFeedSubscription
	}

	return db.feedSubscription.create({
		data: where
	})
}

export {
	createUser,
	getUserByEmail,
	getSubscribedFeeds,
	createFeedSubscription,
	deleteSubscription
}
