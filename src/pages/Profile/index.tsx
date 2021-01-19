import React, { useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
  ImagePickerIOS,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Form } from "@unform/mobile";
import { FormHandles } from "@unform/core";
import * as Yup from "yup";
import Icon from "react-native-vector-icons/Feather";
import {launchImageLibrary} from 'react-native-image-picker';

import api from "../../services/api";

import getValidationErrors from "../../utils/getValidationErrors";

import Input from "../../components/Input";
import Button from "../../components/Button";

import {
  Container,
  Title,
  BackButton,
  UserAvatarButton,
  UserAvatar,
} from "./styles";
import { useAuth } from "../../hooks/Auth";

interface ProfileFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const formRef = useRef<FormHandles>(null);
  const navigation = useNavigation();

  const emailInputRef = useRef<TextInput>(null);
  const OldPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const ConfirmPasswordInputRef = useRef<TextInput>(null);

  const handleSignUp = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});
        const schema = Yup.object().shape({
          name: Yup.string().required("Name required"),
          email: Yup.string()
            .required("Email required")
            .email("Please insert a valid email"),
          old_password: Yup.string(),
          password: Yup.string().when("old_password", {
            is: (val) => !!val.length,
            then: Yup.string().required("Required field"),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .when("old_password", {
              is: (val) => !!val.length,
              then: Yup.string().required("Required field"),
              otherwise: Yup.string(),
            })
            .oneOf([Yup.ref("password")], "Passwords must match."),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const {
          name,
          email,
          old_password,
          password,
          password_confirmation,
        } = data;

        const formData = {
          name,
          email,
          ...(old_password
            ? {
                old_password,
                password,
                password_confirmation,
              }
            : {}),
        };

        const response = await api.put("/profile", formData);
        updateUser(response.data);

        Alert.alert("Your profile was succesffully updated");

        navigation.goBack();
      } catch (err) {
        // console.log(err);
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

          return;
        }

        Alert.alert(
          "Profile update error",
          "Sorry, we couldn't update your profile, try again"
        );
      }
    },
    [navigation, updateUser]
  );

  const handleUpdateAvatar = useCallback(() => {
    launchImageLibrary({
        mediaType: 'photo'
    } ,response => {
        if (response.didCancel) {
            return;
        }

        if (response.errorCode) {
            Alert.alert('Error while updating your avatar');
            return;
        } 

        const data = new FormData();

        data.append('avatar', {
            type: 'image/jpeg',
            name: `${user.id}.jpg`,
            uri: response.uri,
        });

        api.patch('users/avatar', data).then(apiResponse => {
            updateUser(apiResponse.data);
        });

    })
  }, [updateUser, user.id]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flex: 1 }}
        >
          <Container>
            <BackButton onPress={handleGoBack}>
              <Icon name="chevron-left" size={24} color="#999591" />
            </BackButton>

            <UserAvatarButton onPress={handleUpdateAvatar}>
              <UserAvatar source={{ uri: user.avatar_url }} />
            </UserAvatarButton>

            <View>
              <Title>My profile</Title>
            </View>

            <Form initialData={user} ref={formRef} onSubmit={handleSignUp}>
              <Input
                autoCapitalize="words"
                name="name"
                icon="user"
                placeholder="Nome"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInputRef.current?.focus();
                }}
              />

              <Input
                ref={emailInputRef}
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
                name="email"
                icon="mail"
                placeholder="E-mail"
                returnKeyType="next"
                onSubmitEditing={() => {
                  OldPasswordInputRef.current?.focus();
                }}
              />

              <Input
                textContentType="newPassword"
                ref={OldPasswordInputRef}
                name="old_password"
                icon="lock"
                placeholder="Current password"
                secureTextEntry
                containerStyle={{ marginTop: 16 }}
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />

              <Input
                textContentType="newPassword"
                ref={passwordInputRef}
                name="password"
                icon="lock"
                placeholder="New Password"
                secureTextEntry
                returnKeyType="next"
                onSubmitEditing={() => {
                  ConfirmPasswordInputRef.current?.focus();
                }}
              />

              <Input
                textContentType="newPassword"
                ref={ConfirmPasswordInputRef}
                name="password_confirmation"
                icon="lock"
                placeholder="Confirm Password"
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={() => {
                  formRef.current?.submitForm();
                }}
              />

              <Button
                onPress={() => {
                  formRef.current?.submitForm();
                }}
              >
                Update profile
              </Button>
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;
