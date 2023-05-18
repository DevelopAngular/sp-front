import { defineConfig } from 'cypress';

export default defineConfig({
	viewportHeight: 1080,
	viewportWidth: 1920,
	defaultCommandTimeout: 10000,
	pageLoadTimeout: 120000,
	screenshotOnRunFailure: false,
	videoUploadOnPasses: false,
	numTestsKeptInMemory: 5,
	fixturesFolder: 'cypress/fixtures',
	env: {
		student1Username: 'demostudent1@cypress.smartpass.app',
		student1Password: 'uG8F2uAhBW',
		studentUsername: 'demostudent2@cypress.smartpass.app',
		studentPassword: 'b3-Iop6(Nt',
		teacherUsername: 'demoteacher1@cypress.smartpass.app',
		teacherPassword: 'j6UmyudW2f',
		adminUsername: 'smartpass-admin@cypress.smartpass.app',
		adminPassword: 'CmN9qyLf',
		secretaryUsername: 'tsecretary@demontehs.org',
		secretaryPassword: 'sectest',
	},
	projectId: 'njhegd',
	e2e: {
		testIsolation: false,
		baseUrl: 'http://localhost:4200',
		specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
	},
});
