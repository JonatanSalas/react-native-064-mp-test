import React from 'react';
import {
	SafeAreaView,
	ScrollView,
	StatusBar,
	StyleSheet,
	View,
	Text,
	Alert,
	TouchableOpacity,
} from 'react-native';
import MercadoPagoCheckout from '@blackbox-vision/react-native-mercadopago-px';

const Env = {
	MP_ACCESS_TOKEN: 'your_access_token',
	MP_PUBLIC_KEY: 'your_public_key',
};

const App = () => {
	const getPreferenceId = async (payer, ...items) => {
		const response = await fetch(
			`https://api.mercadopago.com/checkout/preferences?access_token=${Env.MP_ACCESS_TOKEN}`,
			{
				method: 'POST',
				body: JSON.stringify({
					items,
					payer: {
						email: payer,
					},
				}),
			},
		);

		const preference = await response.json();

		return preference.id;
	};

	const startCheckout = async ({title, description, amount}) => {
		try {
			const preferenceId = await getPreferenceId('payer@email.com', {
				title,
				description,
				quantity: 1,
				currency_id: 'ARS',
				unit_price: amount,
			});

			console.info('preferenceId', preferenceId);

			const payment = await MercadoPagoCheckout.createPayment({
				publicKey: Env.MP_PUBLIC_KEY,
				preferenceId,
			});

			if (payment.status === 'in_process') {
				Alert.alert(
					'Payment In Progress',
					'You will receive an email when the payment of the product is complete',
				);
			} else {
				if (payment.status === 'rejected') {
					Alert.alert(
						'Payment Rejected',
						'Please retry payment. If error persists contact support',
					);
				}

				Alert.alert(
					'Payment succeed',
					'You will receive an email with the invoice of your product',
				);
			}
		} catch (err) {
			console.info('err', err);

			if (err.message.includes('cancel')) {
				Alert.alert(
					'Payment was cancelled',
					'You can keep checking out our products',
				);
			} else {
				Alert.alert(
					'Payment checkout issue',
					'Please retry payment. If error persists contact support',
				);
			}
		}
	};

	return (
		<SafeAreaView>
			<StatusBar />
			<ScrollView contentInsetAdjustmentBehavior="automatic">
				<View
					style={{
						flex: 1,
						alignContent: 'center',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
					<TouchableOpacity
						onPress={async () => {
							await startCheckout({
								title: 'PROD-1',
								description: 'A product',
								amount: 16.5,
							});
						}}>
						<Text>Pay</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	sectionContainer: {
		marginTop: 32,
		paddingHorizontal: 24,
	},
	sectionTitle: {
		fontSize: 24,
		fontWeight: '600',
	},
	sectionDescription: {
		marginTop: 8,
		fontSize: 18,
		fontWeight: '400',
	},
	highlight: {
		fontWeight: '700',
	},
});

export default App;
