/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TextInput,
  ToastAndroid,
  Switch,
  TouchableOpacity,
  LogBox,
  Modal,
} from 'react-native';
import {GoogleSignin, User} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import {
  Table,
  Row,
  TableWrapper,
  Cell,
} from 'react-native-table-component';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

// type SectionProps = PropsWithChildren<{
//   title: string;
// }>;

type MessageDetail = {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: object;
  sizeEstimate: number;
  raw: string;
};

type SentMessage = {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: object;
  sizeEstimate: number;
  raw: string;
};
const client_ID =
  '437098112626-egf6t7r8s3cnubilo3dib0firighrp5s.apps.googleusercontent.com';

  // const api_Key = 'AIzaSyB6CmbWMau8t77lAAK7X2VFI7DZSulyzoU';

// function Section({children, title}: SectionProps): React.JSX.Element {
//   const isDarkMode = useColorScheme() === 'dark';
//   return (
//     <View style={styles.sectionContainer}>
//       <Text
//         style={[
//           styles.sectionTitle,
//           {
//             color: isDarkMode ? Colors.white : Colors.black,
//           },
//         ]}>
//         {title}
//       </Text>
//       <Text
//         style={[
//           styles.sectionDescription,
//           {
//             color: isDarkMode ? Colors.light : Colors.dark,
//           },
//         ]}>
//         {children}
//       </Text>
//     </View>
//   );
// }

function App(): React.JSX.Element {
  LogBox.ignoreAllLogs();
  LogBox.ignoreLogs(['Invalid prop textStyle of type array supplied to Cell']);
  const [user, setUser] = React.useState<User | undefined>();
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [accessToken, setAccessToken] = React.useState('');
  const [messageDetailList, setMessageDetailList] = React.useState<MessageDetail[]>([]);
  const [messageList, setMessageList] = React.useState<any>([]);
  const [sentDetailList, setSentDetailList] = React.useState<SentMessage[]>([]);
  const [sentList, setSentList] = React.useState<any>([]);
  const [encrypt, setEncrypt] = React.useState(false);
  const [decrypt, setDecrypt] = React.useState(false);
  const [decryptedMessage, setDescryptedMessage] = React.useState('');
  const [blockKey, setBlockKey] = React.useState('');
  const [signature, setSignature] = React.useState(false);
  const [mode, setMode] = React.useState(1); //1: kirim pesan, 2:inbox, 3:pesan terkirim
  const [to, setTo] = React.useState('');
  const [subjects, setSubjects] = React.useState('');
  const [rawEmail, setRawEmail] = React.useState('');
  const [inboxModal, setInboxModal] = React.useState<boolean[]>(
    new Array(10).fill(false),
  );
  const [sentModal, setSentModal] = React.useState<boolean[]>(
    new Array(10).fill(false),
  );
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const emailSentToast = () => {
    ToastAndroid.showWithGravity(
      'Email Sent!',
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
  };
  // const emailFecthingDone = () => {
  //   ToastAndroid.showWithGravity(
  //     'Email Fecthing Completed!',
  //     ToastAndroid.SHORT,
  //     ToastAndroid.CENTER,
  //   );
  // };
  const getMessageHeaderValue = React.useCallback(
    (headers: any[], target: string) => {
      for (const idx in headers) {
        if (headers[idx].name === target) {
          return headers[idx].value;
        }
      }
    },
    [],
  );
  const renderInbox = (choice: string) => {
    let messagePayload: any = [];
    let messageHeader: any = [];
    let headerFrom: any = [];
    let headerSubject: any = [];
    let headerDate: any = [];
    let headerTo: any = [];
    let snippet: any = [];
    const tableHead =
      choice === 'INBOX'
        ? ['From', 'Subject', 'Date']
        : ['To', 'Subject', 'Date'];
    let messageRaw: any = [];
    let tableData: any = [];
    const mList = choice === 'INBOX' ? messageList : sentList;

    for (const idx in mList) {
      messagePayload.push(mList[idx].payload);
      snippet.push(mList[idx].snippet);
      messageRaw.push(mList[idx].raw);
      // console.log('raw', mList[idx]);
    }
    for (const idx in messagePayload) {
      if (messagePayload[idx] !== undefined) {
        messageHeader.push(messagePayload[idx].headers);
      }
    }
    for (const idx in messageHeader) {
      if (choice === 'INBOX') {
        headerFrom.push(getMessageHeaderValue(messageHeader[idx], 'From'));
      } else {
        headerTo.push(getMessageHeaderValue(messageHeader[idx], 'To'));
      }
      headerSubject.push(getMessageHeaderValue(messageHeader[idx], 'Subject'));
      headerDate.push(getMessageHeaderValue(messageHeader[idx], 'Date'));
    }
    for (const idx in messageHeader) {
      let data = [];
      if (choice === 'INBOX') {
        data.push(headerFrom[idx]);
      } else {
        data.push(headerTo[idx]);
      }
      data.push(headerSubject[idx]);
      data.push(headerDate[idx]);
      tableData.push(data);
    }
    const element = (data: any, index: any) => {
      return (
        <TouchableOpacity
          onPress={() => {
            if (choice === 'INBOX') {
              let temp = [...inboxModal];
              temp[index] = !temp[index];
              setInboxModal(temp);
            } else {
              let temp = [...sentModal];
              temp[index] = !temp[index];
              setSentModal(temp);
            }
            console.log('MessagePayload', mList[index], messageRaw[index]);
          }}>
          <View
            style={{
              width: '100%',
              height: 60,
              backgroundColor: 'gray',
              borderRadius: 2,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: '#fff',
              }}>
              {data}
            </Text>
          </View>
          <Modal
            visible={
              choice === 'INBOX'
                ? inboxModal[index] === true
                : sentModal[index] === true
            }
            animationType="slide"
            transparent={true}
            onRequestClose={() => {
              if (choice === 'INBOX') {
                let temp = [...inboxModal];
                temp[index] = !temp[index];
                setInboxModal(temp);
              } else {
                let temp = [...sentModal];
                temp[index] = !temp[index];
                setSentModal(temp);
              }
            }}>
            <View style={styles.modalView}>
              <View style={styles.centeredView1}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 18,
                    textAlign: 'center',
                  }}>
                  Subject
                </Text>
                <View>
                  <Text
                    style={{
                      textAlign: 'center',
                    }}
                    numberOfLines={2}>
                    {headerSubject[index]}
                  </Text>
                </View>
              </View>
              {choice === 'INBOX' && (
                <View style={styles.centeredView1}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 18,
                      textAlign: 'center',
                    }}>
                    From
                  </Text>
                  <View>
                    <Text
                      style={{
                        textAlign: 'center',
                      }}
                      numberOfLines={1}>
                      {headerFrom[index]}
                    </Text>
                  </View>
                </View>
              )}
              {choice !== 'INBOX' && (
                <View style={styles.centeredView1}>
                  <Text style={{fontWeight: 'bold', fontSize: 18}}>
                    Sent To
                  </Text>
                  <View>
                    <Text numberOfLines={1}>{headerTo[index]}</Text>
                  </View>
                </View>
              )}
              <View style={styles.centeredView2}>
                <View style={{borderColor: 'black', borderRadius: 2}}>
                  <Text numberOfLines={10} style={{textAlign: 'center'}}>
                    {snippet[index]}
                  </Text>
                </View>
              </View>
              <View style={{marginBottom: 10}}>
                <Button
                  title="Close"
                  onPress={() => {
                    if (choice === 'INBOX') {
                      let temp = [...inboxModal];
                      temp[index] = !temp[index];
                      setInboxModal(temp);
                    } else {
                      let temp = [...sentModal];
                      temp[index] = !temp[index];
                      setSentModal(temp);
                    }
                  }}
                />
              </View>
            </View>
          </Modal>
        </TouchableOpacity>
      );
    };
    return (
      <View style={styles.inboxContainer}>
        <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
          <Row data={tableHead} textStyle={{textAlign: 'center'}} />
          {tableData &&
            tableData.map((rowData: any, index: any) => (
              <TableWrapper
                key={index}
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#ffffff',
                  width: '100%',
                }}>
                {rowData &&
                  rowData.map((cellData: any, cellIndex: any) => (
                    <Cell
                      key={cellIndex}
                      data={element(cellData, index)}
                      textStyle={{textAlign: 'center'}}
                    />
                  ))}
              </TableWrapper>
            ))}
        </Table>
      </View>
    );
  };

  // const encryptEmail = React.useCallback(
  //   (message: string) => {
  //     let msg = encryptMessage(blockKey, message, 'ebc');
  //     return msg;
  //   },
  //   [blockKey],
  // ); //TO DO
  // const signEmail = () => {}; //TO DO

  const getMessageDetailList = React.useCallback(() => {
    fetch(
      `https://gmail.googleapis.com/gmail/v1/users/${user?.user.email}/messages?maxResults=10&labelIds=INBOX`,
      {
        method: 'GET',
        headers: new Headers({Authorization: `Bearer ${accessToken}`}),
      },
    )
      .then(data => data.json())
      .then(jsondata => {
        // console.log(jsondata);
        setMessageDetailList(jsondata.messages);
      });
  }, [accessToken, user]);
  const messageIDList = React.useMemo(() => {
    const idList: any[] = [];
    if (loggedIn && messageDetailList) {
      messageDetailList.forEach((item) => {
        idList.push(item?.id);
      });
    }
    return idList;
  }, [messageDetailList, loggedIn]);
  const fetchMessages = React.useCallback(() => {
    let responses: any = [];
    for (const val in messageIDList) {
      //console.log(messageIDList[val]);
      let response = fetch(
        `https://gmail.googleapis.com/gmail/v1/users/${user?.user.email}/messages/${messageIDList[val]}?`,
        {
          method: 'GET',
          headers: new Headers({Authorization: `Bearer ${accessToken}`}),
        },
      ).then(res => {
        return res.json();
      });
      responses.push(response);
    }
    return Promise.all(responses).then(values => setMessageList(values));
  }, [accessToken, messageIDList, user?.user.email]);

  const getSentDetailList = React.useCallback(() => {
    fetch(
      `https://gmail.googleapis.com/gmail/v1/users/${user?.user.email}/messages?maxResults=10&labelIds=SENT`,
      {
        method: 'GET',
        headers: new Headers({Authorization: `Bearer ${accessToken}`}),
      },
    )
      .then(data => data.json())
      .then(jsondata => {
        // console.log(jsondata);
        setSentDetailList(jsondata.messages);
      });
  }, [accessToken, user]);
  const sentIDList = React.useMemo(() => {
    var idList: string[] = [];
    if (loggedIn && sentDetailList) {
      sentDetailList.forEach((key) => {
        idList.push(key.id);
      });
    }
    return idList;
  }, [sentDetailList, loggedIn]);
  const fetchSentMessages = React.useCallback(() => {
    let responses: any = [];
    for (const val in sentIDList) {
      //console.log(messageIDList[val]);
      let response = fetch(
        `https://gmail.googleapis.com/gmail/v1/users/${user?.user.email}/messages/${sentIDList[val]}`,
        {
          method: 'GET',
          headers: new Headers({Authorization: `Bearer ${accessToken}`}),
        },
      ).then(res => {
        return res.json();
      });
      responses.push(response);
    }
    return Promise.all(responses).then(values => setSentList(values));
  }, [accessToken, sentIDList, user?.user.email]);

  const sendMessage = React.useCallback(
    async (
      address: string | any,
      sender: string | any,
      subject: string | any,
      content: string,
      signed: boolean,
      encryptt: boolean,
    ) => {
      let messageHeaders: any = {
        To: `${address}`,
        From: `${sender}`,
        Subject: `${subject}`,
      };
      let email = '';
      for (let header in messageHeaders) {
        email += header += ': ' + messageHeaders[header] + '\r\n';
      }
      let temp = content;
      if (encryptt === true) {
        try {
          const response = await fetch('https://dawascryptapp.vercel.app/api/encrypt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              key: blockKey,     // You'll need to define this or pass it in
              message: temp,
              mode: 1,
            }),
          });
          const result = await response.json();
          if (response.ok && result.ciphertext) {
            temp = result.ciphertext;
          } else {
            console.error('Encryption error:', result.error || 'Unknown error');
          }
        } catch (error) {
          console.error('Encryption API failed:', error);
        }
      }
      email += '\r\n' + temp;
      // console.log("sss", email);

      try {
        fetch(
          `https://gmail.googleapis.com/upload/gmail/v1/users/${user?.user.email}/messages/send`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'message/rfc822',
              Authorization: `Bearer ${accessToken}`,
            },
            body: email,
          },
        )
          .then(response => response.json())
          .then(responsedata => {
            console.log('Send', responsedata);
            emailSentToast();
            getMessageDetailList();
            fetchMessages();
            getSentDetailList();
            fetchSentMessages();
          });
      } catch (error) {
        console.log('Send', error);
      }
    },
    [
      accessToken,
      fetchMessages,
      fetchSentMessages,
      getMessageDetailList,
      getSentDetailList,
      user?.user.email,
      blockKey,
    ],
  );

  const decryptMessage = React.useCallback(
    async (ciphertext: string): Promise<string | null> => {
      try {
        const response = await fetch('https://dawascryptapp.vercel.app/api/decrypt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: blockKey,
            ciphertext: ciphertext,
            mode: 1 ,
          }),
        });
        const result = await response.json();
        if (response.ok && result.plaintext) {
          return result.plaintext;
        } else {
          console.error('Decryption error:', result.error || 'Unknown error');
          return null;
        }
      } catch (error) {
        console.error('Decryption API failed:', error);
        return null;
      }
    },
    [blockKey]
  );

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setLoggedIn(true);
      if (userInfo.type === 'success') {
        setUser(userInfo.data); // this is the actual `User` object
      }
      const tokens = await GoogleSignin.getTokens();
      console.log(tokens);
      const credential = auth.GoogleAuthProvider.credential(
        tokens.idToken,
        tokens.accessToken,
      );
      setAccessToken(tokens.accessToken);
      await auth().signInWithCredential(credential);
      await getMessageDetailList();
      await fetchMessages();
      await getSentDetailList();
      await fetchSentMessages();
    } catch (error) {
      console.log(error);
    }
  };
  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      setUser(undefined); // Remember to remove the user from your app's state as well
      setLoggedIn(false);
      setAccessToken('');
      setEncrypt(false);
      setSignature(false);
      setMode(1);
      setRawEmail('');
      setSubjects('');
      setTo('');
      setMessageList([]);
      setMessageDetailList([]);
      setSentList([]);
      setSentDetailList([]);
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    GoogleSignin.configure({
      scopes: ['https://mail.google.com/'],
      webClientId: client_ID,
      offlineAccess: true,
    });
  }, [accessToken]);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            flex: 1,
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <Text style={styles.sectionTitle}>DAWASCrypt</Text>
          {user === undefined && (
            <View
              style={[
                styles.container,
                {
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                  margin: 5,
                },
              ]}>
              <Button
                title="Sign In"
                disabled={user !== undefined}
                onPress={signIn}
              />
              <Text>Sign In to Use The App</Text>
            </View>
          )}
          {user !== undefined && (
            <View
              style={[
                styles.container,
                {
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                  margin: 5,
                },
              ]}>
              <Button title="Sign Out" onPress={signOut} />
              <Text>{`Welcome ${user.user?.name} !`}</Text>
            </View>
          )}
        </View>
        {loggedIn && (
          <View style={styles.modeContainer}>
            <View style={styles.switchContainer}>
              <Button
                title="Compose"
                onPress={async () => {
                  setMode(1);
                  await getMessageDetailList();
                  await fetchMessages();
                  await getSentDetailList();
                  await fetchSentMessages();
                }}
                disabled={mode === 1}
              />
              <Button
                title="Inbox"
                onPress={() => {
                  setMode(2);
                }}
                disabled={mode === 2}
              />
              <Button
                title="Email Sent"
                onPress={() => {
                  setMode(3);
                }}
                disabled={mode === 3}
              />
            </View>
          </View>
        )}
        {/* compose */}
        {loggedIn && mode === 1 && (
          <View>
            <View style={styles.switchContainer}>
              <View>
                <Switch
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  value={encrypt}
                  onChange={() => {
                    console.log('Encrypt? ', !encrypt);
                    setEncrypt(!encrypt);
                  }}
                  disabled={decrypt === true}
                />
                <Text>Encrypt</Text>
              </View>
              <View>
                <Switch
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  value={signature}
                  onChange={() => {
                    console.log('Digital Sign? ', !signature);
                    setSignature(!signature);
                  }}
                  disabled={decrypt === true}
                />
                <Text>Digital Sign</Text>
              </View>
              <View>
                <Switch
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  value={decrypt}
                  onChange={() => {
                    console.log('Digital Sign? ', !signature);
                    setDecrypt(!decrypt);
                    setDescryptedMessage('');
                    setRawEmail('');
                    setBlockKey('');
                  }}
                />
                <Text>Decrypt</Text>
              </View>
            </View>
            {!decrypt && (<View style={styles.inputContainer}>
              <TextInput
                style={styles.contentInput}
                onChangeText={setTo}
                value={to}
                placeholder="To"
                textAlignVertical="center"
                multiline={true}
                textBreakStrategy="highQuality"
                textContentType="emailAddress"
              />
            </View>
            )}
            {!decrypt && (<View style={styles.inputContainer}>
              <TextInput
                style={styles.contentInput}
                onChangeText={setSubjects}
                value={subjects}
                placeholder="Subject"
                textAlignVertical="center"
                multiline={true}
                textBreakStrategy="highQuality"
                maxLength={100}
              />
            </View>
            )}
            {(encrypt === true || decrypt === true) && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.contentInput}
                  onChangeText={setBlockKey}
                  value={blockKey}
                  placeholder="Encryption Key"
                  textAlignVertical="center"
                  multiline={true}
                  textBreakStrategy="highQuality"
                  maxLength={32}
                />
              </View>
            )}
            <View style={styles.emailInputContainer}>
              <TextInput
                style={styles.emailContentInput}
                onChangeText={setRawEmail}
                value={rawEmail}
                placeholder="Insert Messages"
                numberOfLines={4}
                textAlignVertical="top"
                multiline={true}
                textBreakStrategy="highQuality"
                maxLength={1000}
              />
            </View>
            {decrypt && decryptedMessage !== '' && (<View style={styles.emailInputContainer}>
              <TextInput
                style={styles.emailContentInput}
                value={decryptedMessage}
                placeholder="Decrypted Message"
                numberOfLines={4}
                textAlignVertical="top"
                multiline={true}
                textBreakStrategy="highQuality"
                // maxLength={400}
              />
            </View>)}
            {!decrypt && (
              <View style={styles.container}>
              <Button
                title="Send Email"
                onPress={() => {
                  const email = user?.user.email;
                  if (to !== '' && rawEmail !== '') {
                    sendMessage(
                      to,
                      email,
                      subjects,
                      rawEmail,
                      signature,
                      encrypt,
                    );
                    setRawEmail('');
                    setSubjects('');
                    setTo('');
                    if (encrypt === true) {
                      setBlockKey('');
                    }
                  } else if (rawEmail === '' && to === '') {
                    ToastAndroid.showWithGravity(
                      'Invalid Messages and Email Address',
                      ToastAndroid.SHORT,
                      ToastAndroid.CENTER,
                    );
                  } else if (to === '') {
                    ToastAndroid.showWithGravity(
                      'Invalid Email Address',
                      ToastAndroid.SHORT,
                      ToastAndroid.CENTER,
                    );
                  } else if (rawEmail === '') {
                    ToastAndroid.showWithGravity(
                      'Insert Your Messages',
                      ToastAndroid.SHORT,
                      ToastAndroid.CENTER,
                    );
                  }
                }}
              />
            </View>
            )}
            {decrypt && (<View style={styles.container}>
              <Button
                title="Decrypt Message"
                onPress={async () => {
                  const msg = await decryptMessage(rawEmail);
                  if(msg !== null){
                    setDescryptedMessage(msg);
                  }
                }}
              />
            </View>
          )}
          </View>
        )}
        {/* inbox */}
        {loggedIn && mode === 2 && messageList && (renderInbox('INBOX') as any)}
        {/* email sent */}
        {loggedIn && mode === 3 && sentList && (renderInbox('SENT') as any)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  container: {
    flex: 1,
    margin: 12,
  },
  emailInputContainer: {
    flex: 1,
    height: '100%',
    margin: 12,
  },
  emailContentInput: {
    height: '100%',
    marginHorizontal: 12,
    borderWidth: 1,
    padding: 10,
  },
  inputContainer: {
    flex: 1,
    height: '100%',
    marginHorizontal: 12,
  },
  contentInput: {
    height: '60%',
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  switchContainer: {
    flex: 1,
    height: '100%',
    marginHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modeContainer: {
    flex: 1,
    margin: 15,
  },
  inboxContainer: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 12,
    height: '100%',
    alignContent: 'center',
    overflow: 'scroll',
  },
  centeredView1: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    height: '20%',
  },
  centeredView2: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    height: '60%',
  },
  modalView: {
    flex: 1,
    flexDirection: 'column',
    margin: 20,
    backgroundColor: 'gray',
    borderRadius: 20,
    height: '90%',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    alignSelf: 'center',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default App;
