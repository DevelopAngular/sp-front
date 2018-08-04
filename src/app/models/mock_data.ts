import { ColorProfile } from './ColorProfile';
import { HallPass } from './HallPass';
import { Invitation } from './Invitation';
import { Location } from './Location';
import { Request } from './Request';
import { User } from './User';

function constructTestPasses(student: User, issuer: User, origin: Location, destination: Location, colorProfile: ColorProfile) {
  let testDate = new Date();

  testDate.setMinutes(testDate.getMinutes() + 1);

  const testPass1 = new HallPass('testPass1', student, issuer,
    new Date(), new Date(), new Date(),
    testDate, testDate, origin,
    destination, 'round_trip', '#1893E9,#05B5DE',
    'https://storage.googleapis.com/courier-static/icons/water-fountain.png', colorProfile);

  testDate = new Date();
  testDate.setDate(testDate.getDate() + 4);
  const testPass2 = new HallPass('testPass2', student, issuer,
    new Date(), new Date(), testDate,
    new Date(), new Date(), origin,
    destination, 'round_trip', '#1893E9,#05B5DE',
    'https://storage.googleapis.com/courier-static/icons/water-fountain.png', colorProfile);

  testDate = new Date();
  testDate.setDate(testDate.getDate() - 1);
  const testPass3 = new HallPass('testPass3', student, issuer,
    new Date(), new Date(), testDate,
    new Date(), new Date(), origin,
    destination, 'one_way', '#1893E9,#05B5DE',
    'https://storage.googleapis.com/courier-static/icons/water-fountain.png', colorProfile);
  testDate = new Date();
  testDate.setDate(testDate.getDate() + 1);
  const testPass4 = new HallPass('testPass4', student, issuer,
    new Date(), new Date(), testDate,
    new Date(), new Date(), origin,
    destination, 'one_way', '#1893E9,#05B5DE',
    'https://storage.googleapis.com/courier-static/icons/water-fountain.png', colorProfile);

  return [testPass1, testPass2, testPass3, testPass4];
}

function constructTestRequests(student: User, issuer: User, origin: Location, destination: Location, colorProfile: ColorProfile) {
  const testDate = new Date();

  const declinedMessage = 'I\'m busy 6th period. Let\'s try 4th. And a whole bunch of stuff to test ' +
    'overflow. I wonder if it will work. And just a little bit more.';

  const testRequest1 = new Request('testRequest1', student, origin, destination,
    'Could we meet to go over my math test 6th period? And a whole bunch of stuff to test overflow. I wonder if it will work.',
    'round_trip', 'denied', null, '#00C0C7,#0B9FC1', 'https://storage.googleapis.com/courier-static/icons/library.png',
    issuer, testDate, declinedMessage,
    true, null, colorProfile, new Date(), new Date(), 600);
  const testRequest2 = new Request('testRequest2', student, origin, destination,
    'Could we meet to go over my math test 6th period? And a whole bunch of stuff to test overflow. I wonder if it will work.',
    'one_way', 'pending', null, '#00C0C7,#0B9FC1', 'https://storage.googleapis.com/courier-static/icons/library.png',
    issuer, testDate, declinedMessage,
    true, null, colorProfile, new Date(), new Date(), 600);
  const testRequest3 = new Request('testRequest3', student, origin, destination,
    'Could we meet to go over my math test 6th period? And a whole bunch of stuff to test overflow. I wonder if it will work.',
    'round_trip', 'pending', null, '#00C0C7,#0B9FC1', 'https://storage.googleapis.com/courier-static/icons/library.png',
    issuer, testDate, declinedMessage,
    true, null, colorProfile, new Date(), new Date(), 600);

  return [testRequest1, testRequest2, testRequest3];
}

function constructTestInvitations(student: User, issuer: User, origin: Location, destination: Location, colorProfile: ColorProfile) {
  const testDate = new Date();


  const testInvitation1 = new Invitation('testInvitation1', student, null,
    destination, [testDate], issuer,
    'status', 10, '#F37426,#F52B4F',
    'https://storage.googleapis.com/courier-static/icons/classroom.png', 'one_way',
    colorProfile, new Date(), new Date(), new Date());
  const testInvitation2 = new Invitation('testInvitation2', student, origin,
    destination, [testDate], issuer,
    'status', 10, '#F37426,#F52B4F',
    'https://storage.googleapis.com/courier-static/icons/classroom.png', 'one_way',
    colorProfile, new Date(), null, new Date());

  return [testInvitation1, testInvitation2];
}

export const testStudent = new User('testStudent', new Date(), new Date(), 'Kyle', 'Cook', 'Kyle Cook', 'mail@mail.com', []);
export const testIssuer = new User('testIssuer', new Date(), new Date(), 'Donald', 'Sawyer', 'Don Sawyer', 'mail@mail.com', []);
export const testOrigin = new Location('testOrigin', 'Ladson', 'MHS', 'C123', 'classroom', false, [], [], [], 15, false);
export const testDestination = new Location('testDestination', 'Water Fountain', 'MHS', 'WF', '', false, [],
  ['round_trip', 'one_way'], [], 15, false);
export const testColorProfile = new ColorProfile('testColorProfile', 'Light-blue', '#0B9FC1,#00C0C7', '#07ABC3',
  '#11CFE5', '#0B9FC1', '#18EEF7');

export const testPasses = constructTestPasses(testStudent, testIssuer, testOrigin, testDestination, testColorProfile);
export const testRequests = constructTestRequests(testStudent, testIssuer, testOrigin, testDestination, testColorProfile);
export const testInvitations = constructTestInvitations(testStudent, testIssuer, testOrigin, testDestination, testColorProfile);
