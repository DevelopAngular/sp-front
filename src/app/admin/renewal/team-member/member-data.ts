type TeamMember = {
	name: string;
	image_name: string;
	email: string;
};

const teamMembers: { [id: string]: TeamMember } = {
	'230559561': { name: 'Sheldon Veluz', image_name: 'sheldon.jpg', email: 'sheldon@smartpass.app' },
	'309171082': { name: 'Patricio Garcia', image_name: 'patricio.jpg', email: 'patricio@smartpass.app' },
	'222374406': { name: 'Jordan Vega', image_name: 'jordan.jpg', email: 'jordan@smartpass.app' },
	'328295599': { name: 'John Villanueva', image_name: 'john.jpg', email: 'john@smartpass.app' },
	'248905086': { name: 'Carlos Esquivel', image_name: 'carlos.jpg', email: 'carlos@smartpass.app' },

	'348823730': { name: 'Tameka Lampkin', image_name: 'tameka.jpg', email: 'tameka@smartpass.app' },
	'204407709': { name: 'Brittany Baker', image_name: 'brittany.png', email: 'bbaker@smartpass.app' },
	'354505038': { name: 'Chris Salomon', image_name: 'chris.jpg', email: 'chris@smartpass.app' },
	'204071593': { name: 'Britt White', image_name: 'britt.png', email: 'britt@smartpass.app' },

	'328295598': { name: 'Andrea Arce', image_name: 'andrea.jpg', email: 'andrea@smartpass.app' },
};

export default teamMembers;
