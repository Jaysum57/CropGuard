import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    AppState, // Keep AppState import
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Ensure this path to your supabase client is correct
import { supabase } from '../lib/supabase'; 

const { width: screenWidth } = Dimensions.get('window');

// 1. APPSTATE AUTO-REFRESH LOGIC
// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. This should only be registered once.
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh()
    } else {
        supabase.auth.stopAutoRefresh()
    }
});


export default function AuthScreen() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    
    // 2. NEW: Loading state from the tutorial code
    const [loading, setLoading] = useState(false); 


    // 3. INTEGRATE SUPABASE SIGN IN
    async function signInWithEmail() {
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        setLoading(false);

        if (error) {
            Alert.alert('Sign In Error', error.message);
        } else {
            // Success: Session established, no need for manual navigation
            // The root layout should handle navigation based on the session state
            // If the router is used, it should be router.replace('/(tabs)')
            router.replace('/(tabs)');
        }
    }


    // 4. INTEGRATE SUPABASE SIGN UP
    async function signUpWithEmail() {
        if (password !== confirmPassword) {
            Alert.alert('Sign Up Error', 'Passwords do not match');
            return;
        }
        
        setLoading(true);

        // Concatenate first and last name for the user's full_name metadata
        const fullName = `${firstName.trim()} ${lastName.trim()}`;

        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    // Pass the full name to the user's metadata, which your SQL trigger
                    // can read to populate the 'profiles' table.
                    full_name: fullName.trim()
                }
            }
        });

        setLoading(false);

        if (error) {
            Alert.alert('Sign Up Error', error.message);
        } else if (!session) {
            Alert.alert('Verification Required', 'Please check your inbox for the email verification link!');
        } else {
            // Success: Session established, navigate to main app
            router.replace('/(tabs)');
        }
    }


    // 5. UPDATE: handleAuth logic to call Supabase functions
    const handleAuth = () => {
        // Basic local validation
        if (!email || !password || (!isLogin && (!confirmPassword || !firstName || !lastName))) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (isLogin) {
            signInWithEmail();
        } else {
            signUpWithEmail();
        }
    };


    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
    };

    return (
        <>
            <View style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.header}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                            disabled={loading} // Disable button while loading
                        >
                            <Ionicons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>
                        
                        <View style={styles.logoContainer}>
                            <View style={styles.logoIcon}>
                                <Ionicons name="leaf" size={32} color="#30BE63" />
                            </View>
                            <Text style={styles.logoText}>CropGuard</Text>
                        </View>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {isLogin 
                                ? 'Sign in to continue protecting your crops' 
                                : 'Join CropGuard to start monitoring your plants'
                            }
                        </Text>

                        <View style={styles.form}>
                            {!isLogin && (
                                <>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="First Name"
                                            value={firstName}
                                            onChangeText={setFirstName}
                                            autoCapitalize="words"
                                            placeholderTextColor="#999"
                                            editable={!loading} // Disable input while loading
                                        />
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Last Name"
                                            value={lastName}
                                            onChangeText={setLastName}
                                            autoCapitalize="words"
                                            placeholderTextColor="#999"
                                            editable={!loading} // Disable input while loading
                                        />
                                    </View>
                                </>
                            )}

                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email Address"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor="#999"
                                    editable={!loading} // Disable input while loading
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    placeholderTextColor="#999"
                                    editable={!loading} // Disable input while loading
                                />
                            </View>

                            {!isLogin && (
                                <View style={styles.inputContainer}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry
                                        placeholderTextColor="#999"
                                        editable={!loading} // Disable input while loading
                                    />
                                </View>
                            )}

                            {isLogin && (
                                <TouchableOpacity style={styles.forgotPassword} disabled={loading}>
                                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                </TouchableOpacity>
                            )}

                            {/* 6. Update Button to use 'loading' state */}
                            <TouchableOpacity 
                                style={[styles.authButton, loading && { opacity: 0.7 }]} 
                                onPress={handleAuth} 
                                disabled={loading}
                            >
                                <Text style={styles.authButtonText}>
                                    {loading 
                                        ? (isLogin ? 'Signing In...' : 'Creating Account...') 
                                        : (isLogin ? 'Sign In' : 'Create Account')
                                    }
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <View style={styles.socialButtons}>
                                {/* Social buttons are dummy for now, but disabled while loading */}
                                <TouchableOpacity style={styles.socialButton} disabled={loading}>
                                    <Ionicons name="logo-google" size={20} color="#DB4437" />
                                    <Text style={styles.socialButtonText}>Google</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.socialButton} disabled={loading}>
                                    <Ionicons name="logo-apple" size={20} color="#000" />
                                    <Text style={styles.socialButtonText}>Apple</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.footerInline}>
                                <Text style={styles.footerText}>
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                </Text>
                                <TouchableOpacity onPress={toggleAuthMode} disabled={loading}>
                                    <Text style={styles.footerLink}>
                                        {isLogin ? 'Sign Up' : 'Sign In'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 40, // Offset back button width
    },
    logoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f9f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 10,
        paddingBottom: 80,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
    },
    form: {
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#333',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#30BE63',
        fontSize: 14,
        fontWeight: '500',
    },
    authButton: {
        backgroundColor: '#30BE63',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#30BE63',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    authButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#999',
        fontSize: 14,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        gap: 8,
    },
    socialButtonText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    footerInline: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    footerLink: {
        color: '#30BE63',
        fontSize: 14,
        fontWeight: '600',
    },
});