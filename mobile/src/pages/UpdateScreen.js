import React, { useMemo } from "react";
import {
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { color, image } from "../themes";
import useAuth from "../hooks/useAuth";
import Input from "../components/Input";
import Button from "../components/Button";
import api from "../services/api";

const schema = yup.object().shape({
  name: yup.string().required("Campo vazio"),
  duration: yup
    .string()
    .trim()
    .min(5, "Tamanho inválido")
    .matches(/[0-5][0-9]:[0-5][0-9]/g, "Formato inválido (mm:ss)")
    .required("Campo vazio"),
});

const UpdateScreen = () => {
  const { email } = useAuth();
  const navigation = useNavigation();
  const routes = useRoute();
  const item = routes.params?.item;
  const title = item ? "Salvar" : "Adicionar";

  const { formState, control, handleSubmit, errors } = useForm({
    resolver: yupResolver(schema),
  });

  function handleBackButton() {
    navigation.goBack();
  }

  async function onSubmit(data) {
    const [min, seg] = data.duration.split(":").map(Number);
    const milli = (min * 60 + seg) * 1000;

    const response = await api.createMusic({
      id: Math.round(Math.random() * 10000 + Math.random()), // Colocar banco como SERIAL
      name: data.name,
      duration: milli,
      albumId: 1,
      email,
    });

    if (!response.ok) {
      Alert.alert("Opa!", response.data.error);
      return;
    }
    Alert.alert("Sucesso!", response.data.message);
  }

  const renderDurationInput = ({ onChange, ...rest }) => {
    return (
      <Input
        {...rest}
        placeholder="Duração"
        keyboardType="number-pad"
        error={errors.duration?.message}
        onChangeText={(text) => {
          const duration = text
            .replace(/\D/g, "")
            .replace(/(\d{2})(\d{2})/, "$1:$2");
          onChange(duration);
        }}
        maxLength={5}
      />
    );
  };

  const enabledButton = useMemo(() => {
    const dirtyKeys = Object.keys(formState.dirtyFields);
    const errorKeys = Object.keys(formState.errors);

    const allFieldsFilled = dirtyKeys.length === 2 && formState.isDirty;
    const noError = errorKeys.length === 0;

    return (allFieldsFilled && noError) || item;
  }, [formState]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ android: "height", ios: "padding" })}
    >
      <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
        <Image source={image.arrowLeft} />
      </TouchableOpacity>
      <View style={styles.content}>
        <Image source={image.itemBig} style={styles.image} />
        <Controller
          name="name"
          as={Input}
          control={control}
          placeholder="Nome da Música"
          defaultValue={""}
          error={errors.name?.message}
        />
        <Controller
          name="duration"
          control={control}
          defaultValue={""}
          render={renderDurationInput}
        />
        <Button
          disabled={!enabledButton}
          backgroundColor={color.roxoClaro}
          title={title}
          onPress={handleSubmit(onSubmit)}
        />
        {/* {item && (
          <Button
            backgroundColor={color.rosa}
            title="Deletar"
            onPress={handleDelete}
          />
        )} */}
      </View>
    </KeyboardAvoidingView>
  );
};

export default UpdateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.roxo,
    paddingBottom: 20,
  },
  backButton: {
    padding: 15,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 170,
    height: 170,
    marginBottom: 20,
  },
});
