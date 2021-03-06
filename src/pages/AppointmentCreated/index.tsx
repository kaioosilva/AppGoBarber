import React, { useCallback, useMemo } from 'react';
import Icon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';
import enUS from 'date-fns/locale/en-US'
import { useNavigation, useRoute } from '@react-navigation/native';

import { 
    Container,
    Title,
    Description,
    OkButton,
    OkButtonText,
} from './styles';

interface RouteParams {
    date: number;
}

const AppointmentCreated: React.FC = () => {
    const { reset } = useNavigation();
    const { params } = useRoute();

    const routeParams = params as RouteParams;

    const handleOkPressed = useCallback(() => {
        reset({
            routes: [
                {
                    name: 'Dashboard'
                }
            ],
            index: 0
        })
    }, [reset]);

    const formattedDate = useMemo(() => { 
        return format(
                routeParams.date,
                "EEEE',' MMMM dd',' yyyy 'at' HH:mm'hrs'",
                { locale: enUS }
            );
    }, [routeParams.date]);

    return (
        <Container >
            <Icon name="check" size={80} color="#04d361" />

            <Title> Your appointment has been created successfully</Title>
            <Description>{formattedDate}</Description>

            <OkButton onPress={handleOkPressed}>
                <OkButtonText>Ok</OkButtonText>
            </OkButton>
        </Container>
    );
};

export default AppointmentCreated;